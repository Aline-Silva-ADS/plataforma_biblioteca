const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/emprestimos?usuario=ID - lista todos os empréstimos de um usuário
router.get('/', async (req, res) => {
  const { usuario } = req.query;
  if (!usuario) return res.status(400).json({ error: 'usuario é obrigatório' });
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(`
      SELECT e.id_emprestimo, e.data_emprestimo, e.data_devolucao_prevista, e.data_devolucao_real, e.status,
             l.titulo, l.autor
      FROM emprestimos e
      JOIN copias c ON e.id_copia = c.id_copia
      JOIN livros l ON c.id_livro = l.id_livro
      WHERE e.id_usuario = ?
      ORDER BY e.data_emprestimo DESC
    `, [usuario]);
    // Marcar como atrasado se status for emprestado e data_devolucao_prevista < hoje
    const hoje = new Date();
    for (const emp of rows) {
      if (emp.status === 'emprestado' && emp.data_devolucao_prevista && new Date(emp.data_devolucao_prevista) < hoje) {
        emp.status = 'atrasado';
      }
    }
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// GET /api/emprestimos/historico - lista todo o histórico de empréstimos
router.get('/historico', async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    // Paginação
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    const offset = (page - 1) * limit;

    // Filtro por RA
    const ra = req.query.ra ? req.query.ra.trim() : '';
    let where = '';
    let params = [];
    if (ra) {
      where = 'WHERE u.RA LIKE ?';
      params.push(`%${ra}%`);
    }

    // Total de registros filtrados
    const [countRows] = await conn.query(`
      SELECT COUNT(*) as total
      FROM emprestimos e
      JOIN usuarios u ON e.id_usuario = u.id_usuario
      JOIN copias c ON e.id_copia = c.id_copia
      JOIN livros l ON c.id_livro = l.id_livro
      ${where}
    `, params);
    const total = countRows[0].total;

    // Registros paginados filtrados
    const [rows] = await conn.query(`
      SELECT e.id_emprestimo, e.data_emprestimo, e.data_devolucao_real,
             u.RA AS ra_aluno, l.titulo AS nome_livro
      FROM emprestimos e
      JOIN usuarios u ON e.id_usuario = u.id_usuario
      JOIN copias c ON e.id_copia = c.id_copia
      JOIN livros l ON c.id_livro = l.id_livro
      ${where}
      ORDER BY e.data_emprestimo DESC
      LIMIT ? OFFSET ?
    `, [...params, limit, offset]);

    res.json({ emprestimos: rows, total });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// PATCH /api/emprestimos/:id/devolver - devolve um empréstimo
router.patch('/:id/devolver', async (req, res) => {
  const { id } = req.params;
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.query(
      'UPDATE emprestimos SET status = ?, data_devolucao_real = ? WHERE id_emprestimo = ?',
      ['devolvido', new Date(), id]
    );

    const [empRows] = await conn.query(
      'SELECT id_usuario, id_copia FROM emprestimos WHERE id_emprestimo = ?',
      [id]
    );
    if (!empRows.length) throw new Error('Empréstimo não encontrado');

    const { id_usuario, id_copia } = empRows[0];

    const [copiaRows] = await conn.query(
      'SELECT id_livro FROM copias WHERE id_copia = ?',
      [id_copia]
    );
    if (!copiaRows.length) throw new Error('Cópia não encontrada');

    const { id_livro } = copiaRows[0];

    await conn.query(
      'UPDATE reservas SET status = ? WHERE id_usuario = ? AND id_livro = ? AND status != ?',
      ['concluida', id_usuario, id_livro, 'concluida']
    );

    await conn.commit();
    res.json({ success: true });

  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// POST /api/emprestimos - realiza o empréstimo
router.post('/', async (req, res) => {
  const { id_usuario, id_livro, data_devolucao_prevista } = req.body;

  if (!id_usuario || !id_livro || !data_devolucao_prevista) {
    return res.status(400).json({
      error: 'id_usuario, id_livro e data_devolucao_prevista são obrigatórios'
    });
  }

  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction();

    const [copias] = await conn.query(
      "SELECT id_copia FROM copias WHERE id_livro = ? AND status = 'disponivel' LIMIT 1",
      [id_livro]
    );

    if (!copias.length) {
      await conn.rollback();
      return res.status(400).json({ error: 'Nenhuma cópia disponível para empréstimo.' });
    }

    const id_copia = copias[0].id_copia;

    const dataReserva = new Date();
    const prazoValidade = new Date(dataReserva.getTime() + 8 * 60 * 60 * 1000);

    await conn.query(
      'INSERT INTO reservas (id_usuario, id_livro, data_reserva, prazo_validade, status) VALUES (?, ?, ?, ?, ?)',
      [id_usuario, id_livro, dataReserva, prazoValidade, 'emprestado']
    );

    await conn.query(
      'INSERT INTO emprestimos (id_usuario, id_copia, data_emprestimo, data_devolucao_prevista, status) VALUES (?, ?, ?, ?, ?)',
      [id_usuario, id_copia, dataReserva, data_devolucao_prevista, 'emprestado']
    );

    await conn.query(
      'UPDATE copias SET status = ? WHERE id_copia = ?',
      ['emprestado', id_copia]
    );

    await conn.commit();
    res.json({ success: true });

  } catch (err) {
    if (conn) await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

module.exports = router;
