
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
// GET /api/reservas?usuario=ID - lista todas as reservas de um usuário
router.get('/', async (req, res) => {
  const { usuario } = req.query;
  if (!usuario) return res.status(400).json({ error: 'usuario é obrigatório' });
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(`
      SELECT r.id_reserva, r.id_livro, r.prazo_validade, r.status, l.titulo
      FROM reservas r
      JOIN livros l ON r.id_livro = l.id_livro
      WHERE r.id_usuario = ?
      ORDER BY r.data_reserva DESC
    `, [usuario]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});
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


// PATCH /api/reservas/expirar - expira reservas com mais de 8 horas e libera cópias
router.patch('/expirar', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    // Seleciona reservas ativas vencidas
    const [expiradas] = await conn.query(`
      SELECT r.id_reserva, r.id_livro
      FROM reservas r
      WHERE r.status = 'ativa' AND r.prazo_validade < NOW()
    `);

    if (expiradas.length === 0) {
      return res.json({ expiradas: 0, livros_liberados: 0 });
    }

    // Expira as reservas
    const ids = expiradas.map(r => r.id_reserva);
    await conn.query(
      `UPDATE reservas SET status = 'expirada' WHERE id_reserva IN (${ids.map(() => '?').join(',')})`,
      ids
    );

    // Libera as cópias dos livros (deixa disponíveis para empréstimo)
    // Só libera se não houver outra reserva ativa para o mesmo livro
    for (const reserva of expiradas) {
      const [outras] = await conn.query(
        'SELECT COUNT(*) as total FROM reservas WHERE id_livro = ? AND status = "ativa"',
        [reserva.id_livro]
      );
      if (outras[0].total === 0) {
        await conn.query(
          'UPDATE copias SET status = "disponivel" WHERE id_livro = ? AND status = "reservado"',
          [reserva.id_livro]
        );
      }
    }

    res.json({ expiradas: ids.length, livros_liberados: expiradas.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
