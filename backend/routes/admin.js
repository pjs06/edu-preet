const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Middleware to protect admin routes
const requireAdminAuth = (req, res, next) => {
    const adminKey = req.headers['x-admin-key'];
    console.log('Admin Auth Check:');
    console.log('Received Key:', adminKey);
    console.log('Expected Key:', process.env.ADMIN_SECRET);

    if (!adminKey || adminKey !== process.env.ADMIN_SECRET) {
        console.log('Auth Failed');
        return res.status(401).json({ error: 'Unauthorized: Invalid Admin Key' });
    }
    console.log('Auth Success');
    next();
};

// Get All System Metrics
router.get('/metrics', requireAdminAuth, async (req, res) => {
    try {
        const client = await pool.connect();
        try {
            // 1. User Stats
            const userStats = await client.query(`
                SELECT 
                    (SELECT COUNT(*) FROM users) as total_users,
                    (SELECT COUNT(*) FROM students) as total_students,
                    (SELECT COUNT(*) FROM parents) as total_parents
            `);

            // 2. Recent Activity (Last 50 events)
            const recentActivity = await client.query(`
                SELECT u.email, l.event_type, l.event_action, l.created_at, l.metadata
                FROM user_activity_log l
                JOIN users u ON l.user_id = u.id
                ORDER BY l.created_at DESC
                LIMIT 50
            `);

            // 3. Learning Session Stats
            const sessionStats = await client.query(`
                SELECT 
                    COUNT(*) as total_sessions,
                    COUNT(*) FILTER (WHERE status = 'active') as active_sessions,
                    AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_duration_seconds
                FROM learning_sessions
            `);

            // 4. Feature Usage
            const featureUsage = await client.query(`
                SELECT feature_name, SUM(total_uses) as total_uses, SUM(success_count) as success_count
                FROM feature_usage
                GROUP BY feature_name
            `);

            // 5. Recent Quiz Performance
            const quizPerformance = await client.query(`
                SELECT 
                    s.name as student_name,
                    ls.subject,
                    ls.current_concept_id,
                    m.checkpoints_attempted,
                    m.checkpoints_passed,
                    ls.started_at as created_at
                FROM learning_sessions ls
                JOIN students s ON ls.student_id = s.id
                JOIN learning_session_metrics m ON ls.id = m.session_id
                ORDER BY ls.started_at DESC
                LIMIT 20
            `);

            res.json({
                counts: userStats.rows[0],
                activity: recentActivity.rows,
                sessions: sessionStats.rows[0],
                features: featureUsage.rows,
                performance: quizPerformance.rows
            });

        } finally {
            client.release();
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
