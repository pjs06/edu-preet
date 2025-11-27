const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const router = express.Router();

// Database connection (can be imported from a shared module, but for now using a new pool or passing it)
// Ideally, we should export the pool from server.js or a db.js file.
// For this step, I will assume we create a db.js file to share the pool.

const { pool } = require('../db');

// Signup (Parents only)
router.post('/signup', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, phone, password, role, name } = req.body;

        if (role !== 'parent') {
            return res.status(400).json({ error: 'Only parents can sign up directly.' });
        }

        await client.query('BEGIN');

        // Check if user exists
        const userCheck = await client.query('SELECT * FROM users WHERE email = $1 OR phone = $2', [email, phone]);
        if (userCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 1. Create User
        const userResult = await client.query(
            `INSERT INTO users (email, phone, password_hash, role, name) 
             VALUES ($1, $2, $3, 'parent', $4) 
             RETURNING id, email, role`,
            [email, phone, passwordHash, name]
        );
        const user = userResult.rows[0];

        // 2. Create Parent Profile
        const parentResult = await client.query(
            `INSERT INTO parents (user_id, name, phone_alternate) 
             VALUES ($1, $2, $3) 
             RETURNING id, name`,
            [user.id, name, phone]
        );
        const parent = parentResult.rows[0];

        await client.query('COMMIT');

        // Generate token
        const token = jwt.sign(
            { userId: user.id, parentId: parent.id, role: 'parent' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            user: { ...user, parentId: parent.id, name: parent.name }
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check user
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }
        const user = userResult.rows[0];

        // Verify role if provided
        if (role && user.role !== role) {
            return res.status(400).json({ error: `Please login as a ${user.role}` });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid Credentials' });
        }

        let profileData = {};
        let tokenPayload = { userId: user.id, role: user.role };

        if (user.role === 'parent') {
            const parentResult = await pool.query('SELECT id, name FROM parents WHERE user_id = $1', [user.id]);
            if (parentResult.rows.length === 0) return res.status(400).json({ error: 'Parent profile not found' });

            profileData = parentResult.rows[0];
            tokenPayload.parentId = profileData.id;
        } else if (user.role === 'student') {
            const studentResult = await pool.query('SELECT id, parent_id, name, grade FROM students WHERE user_id = $1', [user.id]);
            if (studentResult.rows.length === 0) return res.status(400).json({ error: 'Student profile not found' });

            profileData = studentResult.rows[0];
            tokenPayload.studentId = profileData.id;
            tokenPayload.parentId = profileData.parent_id;
        }

        // Generate token
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                ...profileData
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Logout (Placeholder for server-side invalidation if needed later)
router.post('/logout', (req, res) => {
    // In a stateless JWT setup, the client just deletes the token.
    // We can add a blacklist here in the future.
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;
