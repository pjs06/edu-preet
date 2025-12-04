const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Start Learning Session
router.post('/start', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const { studentId, subject, grade, chapterId, conceptId } = req.body;
        // Note: req.user.sessionId is the *login* session. 
        // We are creating a *learning* session here.

        await client.query('BEGIN');

        // 1. Create learning session
        const sessionRes = await client.query(`
            INSERT INTO learning_sessions (
                student_id, subject, grade, chapter_id, current_concept_id, status
            )
            VALUES ($1, $2, $3, $4, $5, 'active')
            RETURNING id
        `, [studentId, subject, grade, chapterId, conceptId]);

        const learningSessionId = sessionRes.rows[0].id;

        // 2. Create metrics record
        await client.query(`
            INSERT INTO learning_session_metrics (session_id, student_id)
            VALUES ($1, $2)
        `, [learningSessionId, studentId]);

        // 3. Log event (using the login session ID for the activity log)
        // We can't use the helper function directly here easily without importing, 
        // but we can insert directly since we are in a transaction.
        // Or we rely on the middleware to log the API call itself.
        // The user requested explicit logging:
        await client.query(`
            INSERT INTO user_activity_log (
                user_id,
                session_id, 
                student_id,
                event_type,
                event_category,
                event_action,
                metadata
            )
            VALUES ($1, $2, $3, 'learning_session', 'learning', 'session_started', $4)
        `, [
            req.user.userId, // The logged in user (parent or student)
            req.user.sessionId, // The login session
            studentId,
            JSON.stringify({ subject, grade, chapterId, learningSessionId })
        ]);

        await client.query('COMMIT');

        res.json({ learningSessionId });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        if (client) client.release();
    }
});

// Get Adaptive Content for a Concept
router.get('/content/:conceptId', async (req, res) => {
    try {
        const { conceptId } = req.params;
        const { language = 'en' } = req.query;

        // Fetch all paths for this concept from cache
        const result = await pool.query(`
            SELECT path_type, generated_content 
            FROM ai_content_cache 
            WHERE concept_id = $1 AND language = $2
        `, [conceptId, language]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Content not found' });
        }

        // Structure the response
        const content = {};
        result.rows.forEach(row => {
            // path_type is lowercase (main, story, analogy), frontend expects uppercase keys
            const key = row.path_type.toUpperCase();
            content[key] = JSON.parse(row.generated_content);
        });

        res.json(content);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Track Progress (Video Complete / Test Attempt)
router.post('/progress', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const { sessionId, studentId, type, data } = req.body;
        // type: 'video_complete' | 'test_attempt'

        await client.query('BEGIN');

        if (type === 'video_complete') {
            // Update metrics
            await client.query(`
                UPDATE learning_session_metrics
                SET total_active_time_seconds = total_active_time_seconds + $1
                WHERE session_id = $2
            `, [data.duration || 0, sessionId]);
        }
        else if (type === 'test_attempt') {
            // Log concept attempt
            await client.query(`
                INSERT INTO concept_attempts (
                    session_id, student_id, concept_id, path_type, 
                    checkpoint_passed, time_taken_seconds, path_taken
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                sessionId,
                studentId,
                data.conceptId,
                data.pathType,
                data.passed,
                data.timeTaken,
                JSON.stringify(data.answers)
            ]);

            // Update metrics
            await client.query(`
                UPDATE learning_session_metrics
                SET checkpoints_attempted = checkpoints_attempted + 1,
                    checkpoints_passed = checkpoints_passed + $1
                WHERE session_id = $2
            `, [data.passed ? 1 : 0, sessionId]);
        }

        await client.query('COMMIT');
        res.json({ success: true });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        if (client) client.release();
    }
});

// Complete Session
router.post('/complete', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const { sessionId, studentId, conceptId, mastered } = req.body;

        await client.query('BEGIN');

        // Close session
        await client.query(`
            UPDATE learning_sessions
            SET status = 'completed', ended_at = NOW()
            WHERE id = $1
        `, [sessionId]);

        // Update student analytics
        if (mastered) {
            await client.query(`
                INSERT INTO student_analytics (
                    student_id, subject, grade, week_start_date, 
                    concepts_mastered, total_concepts_attempted
                )
                VALUES ($1, 'Science', 8, DATE_TRUNC('week', CURRENT_DATE), 1, 1)
                ON CONFLICT (student_id, subject, grade, week_start_date)
                DO UPDATE SET 
                    concepts_mastered = student_analytics.concepts_mastered + 1,
                    total_concepts_attempted = student_analytics.total_concepts_attempted + 1
            `, [studentId]);
        }

        await client.query('COMMIT');
        res.json({ success: true });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        client.release();
    }
});

module.exports = router;
