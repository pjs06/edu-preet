const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Create Student Profile (Parent creates this)
router.post('/', async (req, res) => {
    try {
        const { userId, name, grade, language, parentId } = req.body;

        const newStudent = await pool.query(
            'INSERT INTO students (user_id, name, grade, language, parent_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [userId, name, grade, language, parentId]
        );

        res.json(newStudent.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get Student Profile
router.get('/:studentId', async (req, res) => {
    try {
        const { studentId } = req.params;
        const student = await pool.query('SELECT * FROM students WHERE id = $1', [studentId]);

        if (student.rows.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.json(student.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
