// backend/config/db.js
// Conexão MySQL usando mysql2/promise para Node.js
// Ajuste variáveis no arquivo .env (DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_CONN_LIMIT)

require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'biblioteca',
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONN_LIMIT, 10) || 10,
  queueLimit: 0,
  charset: 'utf8mb4'
});

module.exports = pool;
