
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const emprestimosRouter = require('./api/emprestimos');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos de capa de livro
app.use('/uploads/capas', express.static(path.join(__dirname, '../uploads/capas')));

// Routers
const copiasRouter = require('./api/copias');
app.use('/api/copias', copiasRouter);

app.use('/api/emprestimos', emprestimosRouter);

const livrosRouter = require('./api/livros');
app.use('/api/livros', livrosRouter);

const usersRouter = require('./api/users');
app.use('/api/users', usersRouter);

const categoriasRouter = require('./api/categorias');
app.use('/api/categorias', categoriasRouter);

const reservasRouter = require('./api/reservas');
app.use('/api/reservas', reservasRouter);

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Backend API running on port ${PORT} (process.env.PORT=${process.env.PORT})`)
);
