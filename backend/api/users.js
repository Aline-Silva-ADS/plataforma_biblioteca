
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/users/ra/:ra - busca aluno pelo RA
router.get('/ra/:ra', async (req, res) => {
  const { ra } = req.params;
  try {
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE RA = ?', [ra]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });
    }
    return res.json({ success: true, usuario: rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


// PATCH /api/users/:id/ativar
router.patch('/:id/ativar', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute('UPDATE usuarios SET situacao = ? WHERE id_usuario = ?', ['ativo', id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// GET /api/users/alunos
router.get('/alunos', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE tipo_usuario = ? ORDER BY data_cadastro DESC', ['aluno']);
    res.json({ success: true, alunos: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// POST /api/users/validate-code
// Recebe { telefone, codigo }, simula validação e retorna dados do usuário
router.post('/validate-code', async (req, res) => {
  const { telefone, codigo } = req.body;
  if (!telefone || !codigo) {
    return res.status(400).json({ success: false, message: 'Telefone e código são obrigatórios.' });
  }
  try {
    const [rows] = await pool.execute('SELECT * FROM usuarios WHERE telefone = ?', [telefone]);
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
    const usuario = rows[0];
    // Simula validação do código (aceita qualquer código)
    return res.json({ success: true, id_usuario: usuario.id_usuario, nome: usuario.nome, tipo_usuario: usuario.tipo_usuario });
  } catch (err) {
    console.error('Erro ao validar código:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


// POST /api/users/send-code
// Recebe { telefone }, verifica se existe, gera código e simula envio (retorna o código)
router.post('/send-code', async (req, res) => {
  const { telefone } = req.body;
  if (!telefone) {
    return res.status(400).json({ success: false, message: 'Telefone é obrigatório.' });
  }
  try {
    const [rows] = await pool.execute('SELECT id_usuario FROM usuarios WHERE telefone = ?', [telefone]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Telefone não encontrado.' });
    }
    // Gera código de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    // Aqui você salvaria o código no banco/cache para validação posterior
    // Simula envio do código (no real, usaria Twilio)
    return res.json({ success: true, code, message: `Código enviado para ${telefone}` });
  } catch (err) {
    console.error('Erro ao simular envio de código:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


function getNowSQL() {
  const d = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}


// POST /api/users
router.post('/', async (req, res) => {
  const { nome, telefone, RA } = req.body;
  let { tipo_usuario, situacao, data_cadastro } = req.body;

  if (!nome || !telefone) {
    return res.status(400).json({ success: false, message: 'Campos obrigatórios: nome, telefone' });
  }

  tipo_usuario = tipo_usuario || 'aluno';
  situacao = situacao || 'pendente';
  data_cadastro = data_cadastro || getNowSQL();

  try {
    const [result] = await pool.execute(
      'INSERT INTO usuarios (nome, telefone, tipo_usuario, RA, situacao, data_cadastro) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, telefone, tipo_usuario, RA, situacao, data_cadastro]
    );
    return res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error inserting user:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});


module.exports = router;
