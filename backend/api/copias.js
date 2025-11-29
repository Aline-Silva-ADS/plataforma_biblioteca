const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/copias/disponiveis/:id_livro - retorna o número de cópias disponíveis para um livro
router.get('/disponiveis/:id_livro', async (req, res) => {
  const { id_livro } = req.params;
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query(
      'SELECT COUNT(*) as disponiveis FROM copias WHERE id_livro = ? AND status = \'disponivel\'',
      [id_livro]
    );
    res.json({ disponiveis: rows[0].disponiveis });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
