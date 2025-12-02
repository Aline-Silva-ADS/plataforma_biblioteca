const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ============================
// GET /api/livros - lista todos
// ============================
router.get('/', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [livros] = await conn.query('SELECT l.id_livro, l.titulo, l.capa FROM livros l');

    // Buscar autores e quantidade de cópias
    for (const livro of livros) {
      const [autores] = await conn.query(
        'SELECT a.nome FROM autores a INNER JOIN livro_autor la ON la.id_autor = a.id_autor WHERE la.id_livro = ?',
        [livro.id_livro]
      );
      livro.autores = autores.map(a => a.nome);

      const [copiasCount] = await conn.query(
        'SELECT COUNT(*) AS total FROM copias WHERE id_livro = ?',
        [livro.id_livro]
      );
      livro.quantidade_copias = copiasCount[0].total;
    }

    res.json({ livros });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ============================
// GET /api/livros/:id - detalhes
// ============================
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    const [livros] = await conn.query('SELECT * FROM livros WHERE id_livro = ?', [id]);
    
    if (!livros.length) return res.status(404).json({ error: 'Livro não encontrado' });

    const livro = livros[0];

    // Autores
    const [autores] = await conn.query(
      'SELECT a.nome FROM autores a INNER JOIN livro_autor la ON la.id_autor = a.id_autor WHERE la.id_livro = ?',
      [id]
    );
    livro.autores = autores.map(a => a.nome);

    // Categorias
    const [categorias] = await conn.query(
      'SELECT c.nome FROM categorias c INNER JOIN livro_categoria lc ON lc.id_categoria = c.id_categoria WHERE lc.id_livro = ?',
      [id]
    );
    livro.categorias = categorias.map(c => c.nome);

    // Quantidade total de cópias
    const [copiasTotal] = await conn.query(
      'SELECT COUNT(*) AS total FROM copias WHERE id_livro = ?', [id]
    );
    livro.quantidade_total = copiasTotal[0].total;

    // Quantidade disponível de cópias
    const [copiasDisponiveis] = await conn.query(
      "SELECT COUNT(*) AS disponiveis FROM copias WHERE id_livro = ? AND status = 'disponível'", [id]
    );
    livro.quantidade_disponivel = copiasDisponiveis[0].disponiveis;

    res.json({ livro });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// ============================
// Upload da capa
// ============================
const uploadDir = path.join(__dirname, '../../uploads/capas');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// ============================
// POST /api/livros - cadastrar livro
// ============================

router.post('/', upload.single('capa'), async (req, res) => {
  console.log('req.file:', req.file);
  console.log('req.body:', req.body);

  let { title, authors, genres, publisher, edition, isbn, language, pages, year, quantity, location, description } = req.body;

  // Convert autores para array
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
      'INSERT INTO livros (titulo, editora, edicao, isbn, idioma, numero_paginas, ano_lancamento, localizacao, descricao, capa) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, publisher, edition, isbn, language, pages, year, location, description, capa]
    );
    const id_livro = livroResult.insertId;

    // 2. Inserir cópias
    const copias = [];
    for (let i = 0; i < Number(quantity); i++) {
      copias.push([id_livro, 'disponível']);
    }
    if (copias.length) {
      await conn.query('INSERT INTO copias (id_livro, status) VALUES ?', [copias]);
    }

    // 3. Inserir autores
    const autorNomes = (authors || []).map(a => a.trim()).filter(Boolean);
    for (const nome of autorNomes) {
      let [autorRows] = await conn.execute('SELECT id_autor FROM autores WHERE nome = ?', [nome]);
      let id_autor;

      if (autorRows.length) {
        id_autor = autorRows[0].id_autor;
      } else {
        const [autorResult] = await conn.execute('INSERT INTO autores (nome) VALUES (?)', [nome]);
        id_autor = autorResult.insertId;
      }

      await conn.execute('INSERT INTO livro_autor (id_livro, id_autor) VALUES (?, ?)', [id_livro, id_autor]);
    }

    // 4. Inserir categorias
    const categoriaIds = (genres || '').split(',').map(id => id.trim()).filter(Boolean);

    for (const id_categoria of categoriaIds) {
      await conn.execute('INSERT INTO livro_categoria (id_livro, id_categoria) VALUES (?, ?)', [id_livro, id_categoria]);
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
