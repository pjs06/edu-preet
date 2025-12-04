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
            console.log('Fetching curriculum for subject:', subject);
            query += ` AND LOWER(subject) = LOWER($${paramCount})`;
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

// Get Content for a Concept and Path Type
router.get('/content/:conceptId/:pathType', async (req, res) => {
    try {
        const { conceptId, pathType } = req.params;
        const { language } = req.query;

        // 1. Check AI Content Cache first
        const cacheRes = await pool.query(`
            SELECT generated_content 
            FROM ai_content_cache 
            WHERE concept_id = $1 AND path_type = $2 AND language = $3
        `, [conceptId, pathType, language || 'hindi']);

        if (cacheRes.rows.length > 0) {
            return res.json({ content: cacheRes.rows[0].generated_content, source: 'cache' });
        }

        // 2. If not in cache, fetch prompt from learning_paths to generate (or return prompt for now)
        const pathRes = await pool.query(`
            SELECT content_prompt, explanation_style 
            FROM learning_paths 
            WHERE concept_id = $1 AND path_type = $2
        `, [conceptId, pathType]);

        if (pathRes.rows.length === 0) {
            // Fallback or 404
            return res.status(404).json({ error: 'Content path not found' });
        }

        // In a real app, we would trigger AI generation here if not cached.
        // For now, return the prompt and metadata.
        res.json({
            prompt: pathRes.rows[0].content_prompt,
            style: pathRes.rows[0].explanation_style,
            source: 'template_prompt'
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
