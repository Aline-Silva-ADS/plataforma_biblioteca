const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cria pasta uploads/capas se não existir
const uploadDir = path.join(__dirname, '../../uploads/capas');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// POST /api/livros - cadastra livro com capa
router.post('/', upload.single('capa'), async (req, res) => {
  let { title, authors, genres, publisher, edition, isbn, language, pages, year, quantity, location, description } = req.body;
  // Se authors vier como string (por compatibilidade), transforma em array
  if (typeof authors === 'string') {
    authors = [authors];
  } else if (!Array.isArray(authors)) {
    authors = [];
  }
  const capa = req.file ? 'uploads/capas/' + req.file.filename : null;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // 1. Inserir livro
    const [livroResult] = await conn.execute(
      'INSERT INTO livros (titulo, editora, edicao, isbn, idioma, numero_paginas, ano_lancamento, quantidade_total, quantidade_disponivel, localizacao, descricao, capa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, publisher, edition, isbn, language, pages, year, quantity, quantity, location, description, capa]
    );
    const id_livro = livroResult.insertId;

    // 2. Inserir cópias
    const copias = [];
    for (let i = 0; i < Number(quantity); i++) {
      copias.push([id_livro, 'disponivel']);
    }
    if (copias.length) {
      await conn.query('INSERT INTO copias (id_livro, status) VALUES ?', [copias]);
    }

    // 3. Inserir autores e relacionamento
    // Suporta múltiplos autores via array
    const autorNomes = (authors || []).map(a => a.trim()).filter(Boolean);
    for (const nome of autorNomes) {
      // Verifica se autor já existe
      let [autorRows] = await conn.execute('SELECT id_autor FROM autores WHERE nome = ?', [nome]);
      let id_autor;
      if (autorRows.length) {
        id_autor = autorRows[0].id_autor;
      } else {
        const [autorResult] = await conn.execute('INSERT INTO autores (nome) VALUES (?)', [nome]);
        id_autor = autorResult.insertId;
      }
      await conn.execute('INSERT INTO livros_autores (id_livro, id_autor) VALUES (?, ?)', [id_livro, id_autor]);
    }

    // 4. Inserir categorias/gêneros
    // Suporta múltiplos ids separados por vírgula
    const categoriaIds = (genres || '').split(',').map(id => id.trim()).filter(Boolean);
    for (const id_categoria of categoriaIds) {
      await conn.execute('INSERT INTO livros_categorias (id_livro, id_categoria) VALUES (?, ?)', [id_livro, id_categoria]);
    }

    await conn.commit();
    res.json({ success: true, id: id_livro, capa });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ success: false, error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
