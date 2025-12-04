const jwt = require('jsonwebtoken');
const { pool } = require('../db');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }

            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};

const trackActivity = async (req, res, next) => {
    if (!req.user) return next();

    const { userId, sessionId } = req.user;

    // If no sessionId in token, skip tracking
    if (!sessionId) return next();

    try {
        // Log the activity
        await pool.query(`
            INSERT INTO user_activity_log (
            user_id,
            session_id,
            event_type,
            event_category,
            event_action,
            page_url,
            metadata
            )
            VALUES ($1, $2, 'api_call', $3, $4, $5, $6)
        `, [
            userId,
            sessionId,
            req.method,      // event_category (as per user request)
            req.path,        // event_action (as per user request)
            req.originalUrl, // page_url
            JSON.stringify(req.body) // metadata
        ]);

        // Wait, the user's query structure was:
        // VALUES ($1, $2, 'api_call', $3, $4, $5, $6)
        // $3 = req.method (event_category?) - No, user said event_type is 'api_call'.
        // So $3 is event_category, $4 is event_action, $5 is page_url, $6 is metadata.
        // Let's adjust to match user's intent more closely.

        /*
        User's code:
        VALUES ($1, $2, 'api_call', $3, $4, $5, $6)
        [userId, sessionId, req.method, req.path, req.originalUrl, JSON.stringify(req.body)]
        
        So:
        $3 (event_category) = req.method
        $4 (event_action) = req.path
        $5 (page_url) = req.originalUrl
        $6 (metadata) = JSON.stringify(req.body)
        */

        // Update last activity
        await pool.query(`
            UPDATE user_sessions
            SET last_activity_at = NOW()
            WHERE id = $1
        `, [sessionId]);
    } catch (err) {
        console.error('Error tracking activity:', err);
    }

    next();
};

module.exports = { authenticateJWT, trackActivity };
