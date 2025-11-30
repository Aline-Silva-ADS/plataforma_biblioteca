const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/emprestimos/ativos - lista todos os empréstimos com status 'emprestado'
router.get('/ativos', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT e.id_emprestimo, e.id_usuario, u.nome AS nome_aluno, u.RA AS ra_aluno, e.id_copia, c.id_livro, l.titulo AS nome_livro, l.localizacao, e.data_emprestimo, e.data_devolucao_prevista, e.status
       FROM emprestimos e
       JOIN usuarios u ON e.id_usuario = u.id_usuario
       JOIN copias c ON e.id_copia = c.id_copia
       JOIN livros l ON c.id_livro = l.id_livro
       WHERE e.status = 'emprestado'`
    );
    res.json({ emprestimos: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// GET /api/reservas/ativas - lista todas as reservas com status 'ativa'
router.get('/reservas/ativas', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      `SELECT r.id_reserva, r.id_usuario, u.nome AS nome_aluno, u.RA AS ra_aluno, r.id_livro, l.titulo AS nome_livro, l.localizacao, r.data_reserva, r.prazo_validade, r.status
       FROM reservas r
       JOIN usuarios u ON r.id_usuario = u.id_usuario
       JOIN livros l ON r.id_livro = l.id_livro
       WHERE r.status = 'ativa'`
    );
    res.json({ reservas: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
