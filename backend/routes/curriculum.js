const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Get Curriculum Structure
router.get('/', async (req, res) => {
    try {
        const { subject, grade, language } = req.query;

        let query = 'SELECT * FROM curriculum WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (subject) {
            query += ` AND subject = $${paramCount}`;
            params.push(subject);
            paramCount++;
        }
        if (grade) {
            query += ` AND grade = $${paramCount}`;
            params.push(grade);
            paramCount++;
        }
        if (language) {
            query += ` AND language = $${paramCount}`;
            params.push(language);
            paramCount++;
        }

        query += ' ORDER BY chapter_number ASC';

        const curriculum = await pool.query(query, params);
        res.json(curriculum.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Concepts in a Chapter
router.get('/:chapterId/concepts', async (req, res) => {
    try {
        const { chapterId } = req.params;
        const chapter = await pool.query('SELECT concepts FROM curriculum WHERE id = $1', [chapterId]);

        if (chapter.rows.length === 0) {
            return res.status(404).json({ error: 'Chapter not found' });
        }

        res.json(chapter.rows[0].concepts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
