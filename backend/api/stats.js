const express = require('express');
const router = express.Router();
const pool = require('../config/db');

router.get('/dashboard', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [[{ total_usuarios }]] = await conn.query('SELECT COUNT(*) as total_usuarios FROM usuarios');
    const [[{ total_livros }]] = await conn.query('SELECT COUNT(*) as total_livros FROM livros');
    const [[{ total_emprestados }]] = await conn.query('SELECT COUNT(*) as total_emprestados FROM emprestimos WHERE status = "emprestado"');
    const [[{ total_atrasados }]] = await conn.query('SELECT COUNT(*) as total_atrasados FROM emprestimos WHERE status = "emprestado" AND data_devolucao_prevista < NOW()');
    res.json({
      usuarios: total_usuarios,
      livros: total_livros,
      emprestados: total_emprestados,
      atrasados: total_atrasados
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
