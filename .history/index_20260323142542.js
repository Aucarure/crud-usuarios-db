const express = require('express');
const cors    = require('cors');
const pool    = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ mensaje: 'API de usuarios funcionando ✅' });
});
pool.query(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id     SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email  VARCHAR(100) UNIQUE NOT NULL,
    edad   INT
  )
`);

app.get('/usuarios', async (req, res) => {
  const result = await pool.query('SELECT * FROM usuarios ORDER BY id');
  res.json(result.rows);
});

app.get('/usuarios/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM usuarios WHERE id=$1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(result.rows[0]);
});

app.post('/usuarios', async (req, res) => {
  const { nombre, email, edad } = req.body;
  const result = await pool.query(
    'INSERT INTO usuarios (nombre, email, edad) VALUES ($1,$2,$3) RETURNING *',
    [nombre, email, edad]
  );
  res.status(201).json(result.rows[0]);
});

app.put('/usuarios/:id', async (req, res) => {
  const { nombre, email, edad } = req.body;
  const result = await pool.query(
    'UPDATE usuarios SET nombre=$1, email=$2, edad=$3 WHERE id=$4 RETURNING *',
    [nombre, email, edad, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'No encontrado' });
  res.json(result.rows[0]);
});

app.delete('/usuarios/:id', async (req, res) => {
  await pool.query('DELETE FROM usuarios WHERE id=$1', [req.params.id]);
  res.json({ mensaje: 'Usuario eliminado' });
});

app.listen(process.env.PORT || 3000, () => console.log('API corriendo'));