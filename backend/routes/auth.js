const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const router = express.Router();
const { pool } = require('../db');
const { updateRetentionCohort } = require('../utils/analytics');

// Signup (Parents only)
router.post('/signup', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const { email, password, role, name } = req.body;

        if (role !== 'parent') {
            return res.status(400).json({ error: 'Only parents can sign up directly.' });
        }

        await client.query('BEGIN');

        // Check if user exists (by email only)
        const userCheck = await client.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 1. Create User
        const userResult = await client.query(
            `INSERT INTO users (email, phone, password_hash, role, name) 
             VALUES ($1, NULL, $2, 'parent', $3) 
             RETURNING id, email, role`,
            [email, passwordHash, name]
        );
        const user = userResult.rows[0];

        // 2. Create Parent Profile
        const parentResult = await client.query(
            `INSERT INTO parents (user_id, name, phone_alternate) 
             VALUES ($1, $2, NULL) 
             RETURNING id, name`,
            [user.id, name]
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
        if (client) client.release();
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

        // Create Session
        const { deviceType, browser, os, ipAddress } = req.body;
        const sessionToken = require('crypto').randomBytes(32).toString('hex'); // Generate a session token

        const sessionResult = await pool.query(`
            INSERT INTO user_sessions (
                user_id, 
                device_type, 
                browser, 
                os, 
                ip_address,
                user_agent,
                session_token,
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
            RETURNING id`,
            [
                user.id,
                deviceType || 'unknown',
                browser || 'unknown',
                os || 'unknown',
                ipAddress || req.ip,
                req.headers['user-agent'],
                sessionToken
            ]
        );
        const sessionId = sessionResult.rows[0].id;

        // Log Login Activity
        await pool.query(`
            INSERT INTO user_activity_log (
                user_id,
                session_id,
                event_type,
                event_category,
                event_action,
                metadata
            )
            VALUES ($1, $2, 'auth', 'authentication', 'login', $3)`,
            [
                user.id,
                sessionId,
                JSON.stringify({ deviceType, browser })
            ]
        );

        // Update Retention Cohort
        await updateRetentionCohort(user.id);

        let profileData = {};
        let tokenPayload = { userId: user.id, role: user.role, sessionId: sessionId }; // Add sessionId to token

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

        const userResponse = {
            id: user.id,
            email: user.email,
            role: user.role,
            name: profileData.name
        };

        if (user.role === 'parent') {
            userResponse.parentId = profileData.id;
        } else if (user.role === 'student') {
            userResponse.studentId = profileData.id;
            userResponse.parentId = profileData.parent_id;
            userResponse.grade = profileData.grade;
            userResponse.language = profileData.language;
        }

        res.json({
            token,
            sessionId,
            user: userResponse
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

// Get Current User (Session Restoration)
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: 'No token provided' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const userResult = await pool.query('SELECT id, email, role FROM users WHERE id = $1', [decoded.userId]);
        if (userResult.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        const user = userResult.rows[0];

        let profileData = {};
        const userResponse = {
            id: user.id,
            email: user.email,
            role: user.role
        };

        if (user.role === 'parent') {
            const parentResult = await pool.query('SELECT id, name FROM parents WHERE user_id = $1', [user.id]);
            if (parentResult.rows.length > 0) {
                profileData = parentResult.rows[0];
                userResponse.name = profileData.name;
                userResponse.parentId = profileData.id;
            }
        } else if (user.role === 'student') {
            const studentResult = await pool.query('SELECT id, parent_id, name, grade, language FROM students WHERE user_id = $1', [user.id]);
            if (studentResult.rows.length > 0) {
                profileData = studentResult.rows[0];
                userResponse.name = profileData.name;
                userResponse.studentId = profileData.id;
                userResponse.parentId = profileData.parent_id;
                userResponse.grade = profileData.grade;
                userResponse.language = profileData.language;
            }
        }

        res.json({ user: userResponse });

    } catch (err) {
        console.error(err.message);
        res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
