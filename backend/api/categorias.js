const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/categorias
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id_categoria, nome FROM categorias');
    res.json({ success: true, categorias: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
