
const express = require('express');
const pool = require('../config/db');
const router = express.Router();

// PATCH /api/reservas/:id/emprestar - atualiza status da reserva para 'emprestada'
router.patch('/:id/emprestar', async (req, res) => {
  const { id } = req.params;
  const conn = await pool.getConnection();
  try {
    await conn.query('UPDATE reservas SET status = ? WHERE id_reserva = ?', ['emprestada', id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

// POST /api/reservas - cria uma nova reserva
router.post('/', async (req, res) => {
  const { id_usuario, id_livro } = req.body;
  if (!id_usuario || !id_livro) {
    return res.status(400).json({ error: 'id_usuario e id_livro são obrigatórios' });
  }
  const conn = await pool.getConnection();
  try {
    const dataReserva = new Date();
    const prazoValidade = new Date(dataReserva.getTime() + 8 * 60 * 60 * 1000); // 8 horas
    const status = 'ativa';
    await conn.query(
      'INSERT INTO reservas (id_usuario, id_livro, data_reserva, prazo_validade, status) VALUES (?, ?, ?, ?, ?)',
      [id_usuario, id_livro, dataReserva, prazoValidade, status]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
