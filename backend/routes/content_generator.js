const express = require('express');
const router = express.Router();
const {
    generateMainScriptPrompt,
    generateStoryScriptPrompt,
    generateAnalogyScriptPrompt,
    generateTestPrompt
} = require('../utils/gemini_prompts');

// Mock function to simulate AI call (replace with actual Gemini/OpenAI call)
const callAI = async (prompt) => {
    // In a real implementation, this would call:
    // const result = await model.generateContent(prompt);
    // return result.response.text();

    return `[MOCK AI RESPONSE]\n\nHere is a generated script based on your prompt:\n\n${prompt.substring(0, 100)}...`;
};

/**
 * @route POST /api/content/generate
 * @desc Generate educational content based on type (main, story, analogy, test)
 * @access Private (Admin only)
 */
router.post('/generate', async (req, res) => {
    try {
        const { type, topic, grade, learningObjectives, missedConcepts, scriptContent, difficulty } = req.body;

        let prompt = '';

        switch (type) {
            case 'main_video':
                if (!topic || !grade || !learningObjectives) {
                    return res.status(400).json({ error: 'Missing required fields for main_video' });
                }
                prompt = generateMainScriptPrompt(topic, grade, learningObjectives);
                break;

            case 'story_video':
                if (!topic || !grade || !missedConcepts) {
                    return res.status(400).json({ error: 'Missing required fields for story_video' });
                }
                prompt = generateStoryScriptPrompt(topic, grade, missedConcepts);
                break;

            case 'analogy_video':
                if (!topic || !grade || !missedConcepts) {
                    return res.status(400).json({ error: 'Missing required fields for analogy_video' });
                }
                prompt = generateAnalogyScriptPrompt(topic, grade, missedConcepts);
                break;

            case 'test':
                if (!topic || !grade || !scriptContent) {
                    return res.status(400).json({ error: 'Missing required fields for test' });
                }
                prompt = generateTestPrompt(topic, grade, scriptContent, difficulty);
                break;

            default:
                return res.status(400).json({ error: 'Invalid content type. Must be: main_video, story_video, analogy_video, or test' });
        }

        // For now, return the generated prompt so we can verify the template logic
        // In production, we would call the AI here
        // const aiResponse = await callAI(prompt);

        res.json({
            success: true,
            type,
            generated_prompt: prompt,
            // ai_response: aiResponse // Uncomment when AI is connected
        });

    } catch (err) {
        console.error('Error generating content:', err);
        res.status(500).json({ error: 'Server error generating content' });
    }
});

module.exports = router;
