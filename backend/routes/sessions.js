const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Start a new learning session
router.post('/start', async (req, res) => {
    try {
        const { studentId, subject, grade, chapterId } = req.body;

        // Get the first concept of the chapter
        const chapter = await pool.query('SELECT concepts FROM curriculum WHERE id = $1', [chapterId]);
        if (chapter.rows.length === 0) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        const concepts = chapter.rows[0].concepts;
        // Assuming concepts is an array and sorted by order
        const firstConcept = concepts.sort((a, b) => a.order - b.order)[0];

        const newSession = await pool.query(
            'INSERT INTO learning_sessions (student_id, subject, grade, chapter_id, current_concept_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [studentId, subject, grade, chapterId, firstConcept.id]
        );

        res.json({
            session: newSession.rows[0],
            firstConcept: firstConcept
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Move to next concept (Simplified logic for now)
router.post('/:sessionId/next-concept', async (req, res) => {
    try {
        const { sessionId } = req.params;
        // Logic to determine next concept would go here
        // For now, just returning a placeholder
        res.json({ message: 'Next concept logic to be implemented' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
