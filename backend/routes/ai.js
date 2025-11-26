const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const OpenAI = require('openai'); // Or Anthropic SDK

// Initialize OpenAI (Mocking for now if key is not present or using a placeholder)
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Generate Explanation
router.post('/generate-explanation', async (req, res) => {
    try {
        const { conceptId, pathType, language, studentContext } = req.body;

        // Check cache first
        const cacheCheck = await pool.query(
            'SELECT * FROM ai_content_cache WHERE concept_id = $1 AND path_type = $2 AND language = $3',
            [conceptId, pathType, language]
        );

        if (cacheCheck.rows.length > 0) {
            return res.json({
                content: cacheCheck.rows[0].generated_content,
                cached: true
            });
        }

        // Generate content (Mocking AI response for now)
        const generatedContent = `This is an AI generated explanation for concept ${conceptId} in ${language} for path ${pathType}.`;

        // Store in cache
        // Note: prompt_hash is required by schema, generating a dummy one
        const promptHash = 'dummy_hash_' + Date.now();

        await pool.query(
            'INSERT INTO ai_content_cache (concept_id, path_type, language, prompt_hash, generated_content) VALUES ($1, $2, $3, $4, $5)',
            [conceptId, pathType, language, promptHash, generatedContent]
        );

        res.json({
            content: generatedContent,
            cached: false
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
