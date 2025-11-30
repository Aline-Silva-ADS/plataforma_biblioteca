const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/emprestimos - realiza o empréstimo de um livro
router.post('/', async (req, res) => {
  const { id_usuario, id_livro, data_devolucao_prevista } = req.body;
  if (!id_usuario || !id_livro || !data_devolucao_prevista) {
    return res.status(400).json({ error: 'id_usuario, id_livro e data_devolucao_prevista são obrigatórios' });
  }
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // 1. Buscar uma cópia disponível
    const [copias] = await conn.query(
      'SELECT id_copia FROM copias WHERE id_livro = ? AND status = \'disponivel\' LIMIT 1',
      [id_livro]
    );
    if (!copias.length) {
      await conn.rollback();
      return res.status(400).json({ error: 'Nenhuma cópia disponível para empréstimo.' });
    }
    const id_copia = copias[0].id_copia;
    // 2. Inserir reserva (status ativo, 8h de validade)
    const dataReserva = new Date();
    const prazoValidade = new Date(dataReserva.getTime() + 8 * 60 * 60 * 1000); // 8 horas
    await conn.query(
      'INSERT INTO reservas (id_usuario, id_livro, data_reserva, prazo_validade, status) VALUES (?, ?, ?, ?, ?)',
      [id_usuario, id_livro, dataReserva, prazoValidade, 'ativa']
    );
    // 3. Inserir empréstimo
    await conn.query(
      'INSERT INTO emprestimos (id_usuario, id_copia, data_emprestimo, data_devolucao_prevista, status) VALUES (?, ?, ?, ?, ?)',
      [id_usuario, id_copia, dataReserva, data_devolucao_prevista, 'emprestado']
    );
    // 4. Atualizar status da cópia para reservado/emprestado
    await conn.query('UPDATE copias SET status = ? WHERE id_copia = ?', ['emprestado', id_copia]);
    await conn.commit();
    res.json({ success: true });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
