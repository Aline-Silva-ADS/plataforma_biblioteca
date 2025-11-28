
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// POST /api/users/validate-code
// Recebe { telefone, codigo }, simula validação e retorna dados do usuário
router.post('/validate-code', async (req, res) => {
  const { telefone, codigo } = req.body;
  if (!telefone || !codigo) {
    return res.status(400).json({ success: false, message: 'Telefone e código são obrigatórios.' });
  }
  try {
    // Busca usuário pelo telefone
    const [rows] = await pool.execute('SELECT id_usuario, nome, tipo_usuario FROM usuarios WHERE telefone = ?', [telefone]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado.' });
    }
    // Simula validação do código (aceita qualquer código)
    const user = rows[0];
    return res.json({ success: true, id_usuario: user.id_usuario, nome: user.nome, tipo_usuario: user.tipo_usuario });
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
// Accepts JSON or form data: nome, telefone, RA (optional), tipo_usuario (optional), situacao (optional), data_cadastro (optional)
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
    const sql = `INSERT INTO usuarios (nome, telefone, tipo_usuario, RA, situacao, data_cadastro) VALUES (?,?,?,?,?,?)`;
    const params = [nome, telefone, tipo_usuario, RA || null, situacao, data_cadastro];
    const [result] = await pool.execute(sql, params);

    return res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error('Error inserting user:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
