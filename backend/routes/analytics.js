const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Middleware to verify token (simplified)
// In production, use a proper JWT middleware that extracts user info
const verifyToken = (req, res, next) => {
    // This assumes the token is verified and decoded by a previous middleware or we decode it here
    // For now, we'll assume req.body or req.headers contains the necessary IDs if not using a full auth middleware yet
    // But ideally, we should use the same middleware as other protected routes.
    // Let's assume the client sends userId and sessionId in the body for tracking endpoints if not authenticated via header.
    next();
};

// --- Session Management ---

// Track Heartbeat (Keep session alive)
router.post('/sessions/track/heartbeat', async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

        await pool.query(`
            UPDATE user_sessions
            SET last_activity_at = NOW()
            WHERE id = $1
        `, [sessionId]);

        res.json({ status: 'success' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Track Logout
router.post('/sessions/track/logout', async (req, res) => {
    try {
        const { sessionId } = req.body;
        if (!sessionId) return res.status(400).json({ error: 'Session ID required' });

        await pool.query(`
            UPDATE user_sessions
            SET 
                logout_at = NOW(),
                status = 'logged_out',
                session_duration_seconds = EXTRACT(EPOCH FROM (NOW() - login_at))
            WHERE id = $1
        `, [sessionId]);

        res.json({ status: 'success' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Event Tracking ---

// Track Generic Event
router.post('/event', async (req, res) => {
    try {
        const { userId, sessionId, eventType, eventCategory, eventAction, eventLabel, metadata, pageUrl } = req.body;

        await pool.query(`
            INSERT INTO user_activity_log (
                user_id,
                session_id,
                event_type,
                event_category,
                event_action,
                event_label,
                page_url,
                metadata
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
            userId,
            sessionId,
            eventType,
            eventCategory,
            eventAction,
            eventLabel,
            pageUrl,
            metadata ? JSON.stringify(metadata) : null
        ]);

        // Also update last activity
        if (sessionId) {
            await pool.query(`UPDATE user_sessions SET last_activity_at = NOW() WHERE id = $1`, [sessionId]);
        }

        res.json({ status: 'success' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- Analytics Dashboard (for Admin/Internal use) ---

// Get Overview Metrics
router.get('/overview', async (req, res) => {
    try {
        // Simple overview for now
        const today = new Date().toISOString().split('T')[0];

        const dauResult = await pool.query(`
            SELECT COUNT(DISTINCT user_id) as dau
            FROM user_sessions
            WHERE login_at::date = CURRENT_DATE
        `);

        const sessionsResult = await pool.query(`
            SELECT COUNT(*) as active_sessions
            FROM user_sessions
            WHERE status = 'active'
        `);

        res.json({
            dau: parseInt(dauResult.rows[0].dau),
            activeSessions: parseInt(sessionsResult.rows[0].active_sessions)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
