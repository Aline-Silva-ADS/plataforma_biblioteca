// backend/api/users.js
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

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
