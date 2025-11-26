const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const router = express.Router();

// Database connection (can be imported from a shared module, but for now using a new pool or passing it)
// Ideally, we should export the pool from server.js or a db.js file.
// For this step, I will assume we create a db.js file to share the pool.

const { pool } = require('../db');

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { email, phone, password, role } = req.body;

        // Check if user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1 OR phone = $2', [email, phone]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await pool.query(
            'INSERT INTO users (email, phone, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role',
            [email, phone, passwordHash, role]
        );

        // Generate token
        const token = jwt.sign({ id: newUser.rows[0].id, role: newUser.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: newUser.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check user
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({ token, user: { id: user.rows[0].id, email: user.rows[0].email, role: user.rows[0].role } });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
