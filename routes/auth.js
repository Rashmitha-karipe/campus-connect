const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
  if (!['student', 'organizer'].includes(role)) return res.status(400).json({ message: 'Invalid role' });
  if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(400).json({ message: 'Email already registered' });

  const hash = bcrypt.hashSync(password, 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(name, email, hash, role);
  res.status(201).json({ message: 'Registered successfully' });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password || '', user.password)) {
    return res.status(401).json({ message: 'Wrong email or password' });
  }
  const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, role: user.role, name: user.name });
});

module.exports = router;
