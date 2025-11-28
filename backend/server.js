// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
const usersRouter = require('./api/users');
app.use('/api/users', usersRouter);

// Optional: serve static files from project root (if you want Node to serve the frontend)
// app.use(express.static(path.join(__dirname, '..')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend API running on port ${PORT} (process.env.PORT=${process.env.PORT})`));
