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
    let client;
    try {
        client = await pool.connect();
        const { conceptId } = req.params;
        const { studentId } = req.query; // Need studentId to personalize

        if (!studentId) {
            return res.status(400).json({ error: 'Student ID required for personalization' });
        }

        // 1. Fetch Student Profile
        const profileResult = await client.query(`
            SELECT * FROM learning_assessments 
            WHERE student_id = $1 
            ORDER BY created_at DESC LIMIT 1
        `, [studentId]);

        let profile = {};
        if (profileResult.rows.length > 0) {
            const p = profileResult.rows[0];
            profile = {
                primaryLearningStyle: p.primary_learning_style,
                mindsetType: p.mindset_type,
                idealContentStyle: p.ideal_content_style,
                supportLevel: p.support_level || 'moderate_encouragement', // Default if missing
                processingSpeed: p.processing_speed
            };
        } else {
            // Default profile if no assessment
            profile = {
                primaryLearningStyle: 'visual',
                mindsetType: 'balanced',
                idealContentStyle: 'structured_text',
                supportLevel: 'moderate_encouragement',
                processingSpeed: 'moderate'
            };
        }

        // 2. Generate Personalized Content (Real AI)
        const { generatePersonalizedPrompt } = require('../utils/promptPersonalizer');
        const { generateContent } = require('../utils/openrouter');

        // Use the conceptId (subtopic name) as the topic
        const topic = decodeURIComponent(conceptId);

        const basePrompt = `
        Create a personalized lesson for a Class 9 student on the topic: "${topic}".
        
        OUTPUT FORMAT:
        Return ONLY a valid JSON object. Do not include any markdown formatting (like \`\`\`json) outside the JSON.
        The JSON must have the following structure:
        {
            "lessonContent": "The text of the lesson...",
            "questions": [
                {
                    "id": "q1",
                    "text": "Question text...",
                    "options": [
                        { "id": "A", "text": "Option A" },
                        { "id": "B", "text": "Option B" },
                        { "id": "C", "text": "Option C" }
                    ],
                    "correctAnswer": "B",
                    "rationale": "Explanation..."
                }
            ]
        }
        
        CRITICAL INSTRUCTIONS:
        1. **EMOJIS ALLOWED**: You may use emojis to make the content engaging.
        2. **VALID JSON**: Ensure all strings are properly escaped. 
           - **IMPORTANT**: Any newlines INSIDE strings must be escaped as \\n. 
           - Do NOT put actual line breaks inside string values.
        3. **NO MARKDOWN BLOCKS**: Return raw JSON only.
        4. **Personalization**: tailored to the student's profile (see below).
        `;

        const personalizedPrompt = generatePersonalizedPrompt(basePrompt, profile);

        console.log(`Generating content for ${topic} with profile: ${profile.primaryLearningStyle}`);

        // Debug: Log the prompt
        // console.log('Prompt:', personalizedPrompt);

        let aiResponseRaw = await generateContent(personalizedPrompt);
        console.log('AI Response Raw:', aiResponseRaw);

        // Parse JSON from AI response (handle potential markdown code blocks)
        let generatedData;
        try {
            // Remove markdown code blocks if present
            const jsonMatch = aiResponseRaw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                // Sanitize: Fix common AI JSON errors like escaped single quotes
                const sanitizedJson = jsonMatch[0]
                    .replace(/\\'/g, "'") // Replace \' with '
                    .replace(/\\"/g, '\\"') // Ensure escaped double quotes are preserved (if any)
                // Note: The above might be risky if not careful, but \' is the main culprit here.
                // Better approach: Just handle \' which is invalid in JSON.

                generatedData = JSON.parse(sanitizedJson);
            } else {
                throw new Error("No JSON found in response");
            }
        } catch (e) {
            console.error("Failed to parse AI response:", e);
            // Fallback if parsing fails
            generatedData = {
                lessonContent: aiResponseRaw || "Error generating lesson content.",
                questions: []
            };
        }

        res.json({
            MAIN: {
                type: 'LESSON',
                title: `${topic}`,
                textContent: generatedData.lessonContent,
                questions: generatedData.questions.length > 0 ? generatedData.questions : [
                    {
                        id: 'q1',
                        text: 'Review the lesson and try again.',
                        options: [{ id: 'A', text: 'Ok' }],
                        correctAnswer: 'A',
                        rationale: 'Parsing error fallback.'
                    }
                ]
            }
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        if (client) client.release();
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
