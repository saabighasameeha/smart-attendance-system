const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Faculty = require('../models/Faculty');

const router = express.Router();

// Register Faculty (use this once to create accounts)
router.post('/faculty/register', async (req, res) => {
  try {
    const { name, facultyId, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const faculty = new Faculty({ name, facultyId, email, password: hashedPassword });
    await faculty.save();
    res.status(201).json({ message: 'Faculty registered successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Faculty Login
router.post('/faculty/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const faculty = await Faculty.findOne({ email });
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });

    const isMatch = await bcrypt.compare(password, faculty.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: faculty._id }, 'secretkey123', { expiresIn: '1d' });
    res.json({ token, faculty: { name: faculty.name, email: faculty.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
router.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ role: 'admin' }, 'secretkey123', { expiresIn: '1d' });
    return res.json({ token, message: 'Admin login successful' });
  }
  return res.status(400).json({ message: 'Invalid admin credentials' });
});

module.exports = router;