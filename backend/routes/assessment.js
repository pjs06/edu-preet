const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Helper to calculate raw scores from responses
function calculateRawScores(responses, questionsMap) {
    const scores = {
        // VARK Scores
        visual: 0,
        auditory: 0,
        readingWriting: 0,
        kinesthetic: 0,

        // Mindset
        growthMindset: 0,
        fixedMindset: 0,

        // Motivation
        intrinsicMotivation: 0,
        extrinsicMotivation: 0,
        competitionDrive: 0,

        // Cognitive
        detailOriented: 0,
        bigPicture: 0,
        processingSpeed: 'moderate',

        // Emotional
        confidenceLevel: 5,
        failureResilience: 5,
        helpSeekingComfort: 5,
        peerComparisonSensitivity: 0,

        // Attention
        sustainedAttentionMinutes: 15,
        preferredChunkSize: 'medium'
    };

    // Process each response
    responses.forEach(response => {
        const question = questionsMap[response.questionId];
        if (!question) return;

        const selectedOption = question.options[response.answer];
        if (selectedOption && selectedOption.scores) {
            Object.keys(selectedOption.scores).forEach(dimension => {
                if (scores.hasOwnProperty(dimension)) {
                    scores[dimension] += selectedOption.scores[dimension];
                }
            });
        }
    });

    return scores;
}

function deriveLearningProfile(scores) {
    // 1. Primary Learning Style
    const varkScores = {
        visual: scores.visual,
        auditory: scores.auditory,
        readingWriting: scores.readingWriting,
        kinesthetic: scores.kinesthetic
    };

    const sortedVARK = Object.entries(varkScores).sort((a, b) => b[1] - a[1]);
    const primaryStyle = sortedVARK[0][0];
    const secondaryStyle = sortedVARK[1][0];

    // Check if multimodal (top 2 scores are close)
    const isMultimodal = (sortedVARK[0][1] - sortedVARK[1][1]) < 3;

    // 2. Mindset Type
    const totalMindset = scores.growthMindset + scores.fixedMindset;
    const mindsetRatio = totalMindset > 0 ? scores.growthMindset / totalMindset : 0.5;

    let mindsetType;
    if (mindsetRatio > 0.75) mindsetType = 'strong_growth';
    else if (mindsetRatio > 0.6) mindsetType = 'growth_leaning';
    else if (mindsetRatio > 0.4) mindsetType = 'balanced';
    else mindsetType = 'fixed_leaning';

    // 3. Ideal Content Style
    let contentStyle;
    if (scores.intrinsicMotivation > scores.extrinsicMotivation + 3) {
        // Intrinsically motivated + learning style
        if (primaryStyle === 'visual') contentStyle = 'visual_discovery';
        else if (primaryStyle === 'auditory') contentStyle = 'story_narrative';
        else if (primaryStyle === 'kinesthetic') contentStyle = 'interactive_experiment';
        else contentStyle = 'structured_text';
    } else {
        // Extrinsically motivated - needs more gamification
        contentStyle = 'gamified_challenge';
    }

    // 4. Optimal Video Duration
    const optimalDuration = Math.round(scores.sustainedAttentionMinutes * 0.6); // Use 60% of max attention

    // 5. Confidence & Resilience Tier (Support Level)
    const averageConfidence = (scores.confidenceLevel + scores.failureResilience + scores.helpSeekingComfort) / 3;
    let supportLevel;
    if (averageConfidence < 4) supportLevel = 'high_encouragement';
    else if (averageConfidence < 7) supportLevel = 'moderate_encouragement';
    else supportLevel = 'minimal_encouragement';

    return {
        primaryLearningStyle: isMultimodal ? `${primaryStyle}_${secondaryStyle}` : primaryStyle,
        mindsetType,
        idealContentStyle: contentStyle,
        optimalVideoDuration: optimalDuration,
        supportLevel,
        processingSpeed: scores.processingSpeed,
        preferredChunkSize: scores.preferredChunkSize
    };
}

// GET /questions - Fetch all assessment questions
router.get('/questions', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM assessment_questions ORDER BY question_order ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /status - Check if student has completed assessment
router.get('/status', async (req, res) => {
    try {
        let { studentId } = req.query;

        console.log('GET /status - Query:', req.query);
        console.log('GET /status - User:', req.user);

        // If no studentId in query, try to get from authenticated user
        if (!studentId && req.user) {
            if (req.user.studentId) {
                studentId = req.user.studentId;
            } else if (req.user.role === 'student') {
                // Fallback: Fetch student ID from DB using user ID (for old tokens)
                const studentRes = await pool.query('SELECT id FROM students WHERE user_id = $1', [req.user.userId]);
                if (studentRes.rows.length > 0) {
                    studentId = studentRes.rows[0].id;
                }
            } else if (req.user.role === 'parent' && req.user.parentId) {
                // Fallback for parents: Fetch first student to show their status/allow testing
                const studentRes = await pool.query('SELECT id FROM students WHERE parent_id = $1 ORDER BY created_at ASC LIMIT 1', [req.user.parentId]);
                if (studentRes.rows.length > 0) {
                    studentId = studentRes.rows[0].id;
                }
            }
        }

        if (!studentId) {
            console.error('GET /status - Missing Student ID. User:', req.user);
            return res.status(400).json({ error: 'Student ID required' });
        }

        const result = await pool.query(
            'SELECT * FROM learning_assessments WHERE student_id = $1 ORDER BY created_at DESC LIMIT 1',
            [studentId]
        );

        if (result.rows.length > 0) {
            const assessment = result.rows[0];
            res.json({
                studentId, // Return the resolved studentId
                completed: true,
                profile: {
                    primaryStyle: assessment.primary_learning_style,
                    mindsetType: assessment.mindset_type,
                    idealContentStyle: assessment.ideal_content_style,
                    optimalVideoDuration: assessment.optimal_video_duration
                }
            });
        } else {
            res.json({
                studentId, // Return the resolved studentId even if not completed
                completed: false
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// POST /submit - Submit assessment and calculate profile
router.post('/submit', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const { studentId, responses, timeTakenMinutes } = req.body;

        // 1. Fetch all questions to validate and score
        const questionsResult = await client.query('SELECT * FROM assessment_questions');
        const questionsMap = {};
        questionsResult.rows.forEach(q => {
            questionsMap[q.id] = q;
        });

        // 2. Calculate Scores & Derive Profile
        const scores = calculateRawScores(responses, questionsMap);
        const derivedProfile = deriveLearningProfile(scores);

        await client.query('BEGIN');

        // 3. Save to learning_assessments
        const assessmentResult = await client.query(`
            INSERT INTO learning_assessments (
                student_id, 
                time_taken_minutes,
                visual_score, auditory_score, reading_writing_score, kinesthetic_score,
                growth_mindset_score, fixed_mindset_score,
                intrinsic_motivation_score, extrinsic_motivation_score, competition_drive_score,
                detail_oriented_score, big_picture_score, processing_speed,
                confidence_level, failure_resilience_score, help_seeking_comfort, peer_comparison_sensitivity,
                sustained_attention_minutes, preferred_chunk_size,
                
                primary_learning_style, 
                mindset_type,
                ideal_content_style,
                optimal_video_duration,
                
                completed_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, 
                $20, $21, $22, $23, $24,
                NOW()
            ) RETURNING id`,
            [
                studentId, timeTakenMinutes,
                scores.visual, scores.auditory, scores.readingWriting, scores.kinesthetic,
                scores.growthMindset, scores.fixedMindset,
                scores.intrinsicMotivation, scores.extrinsicMotivation, scores.competitionDrive,
                scores.detailOriented, scores.bigPicture, scores.processingSpeed,
                scores.confidenceLevel, scores.failureResilience, scores.helpSeekingComfort, scores.peerComparisonSensitivity,
                scores.sustainedAttentionMinutes, scores.preferredChunkSize,

                derivedProfile.primaryLearningStyle,
                derivedProfile.mindsetType,
                derivedProfile.idealContentStyle,
                derivedProfile.optimalVideoDuration
            ]
        );
        const assessmentId = assessmentResult.rows[0].id;

        // 4. Save individual responses
        for (const response of responses) {
            const question = questionsMap[response.questionId];
            if (question) {
                const answerText = question.options[response.answer].text;
                await client.query(`
                    INSERT INTO assessment_responses (assessment_id, question_id, student_answer)
                    VALUES ($1, $2, $3)
                `, [assessmentId, response.questionId, answerText]);
            }
        }

        await client.query('COMMIT');

        res.json({
            success: true,
            assessmentId,
            profile: {
                primaryStyle: derivedProfile.primaryLearningStyle,
                mindsetType: derivedProfile.mindsetType,
                scores
            }
        });

    } catch (err) {
        if (client) await client.query('ROLLBACK');
        console.error('Assessment Submit Error:', err);
        res.status(500).json({ error: err.message, stack: err.stack });
    } finally {
        if (client) client.release();
    }
});

module.exports = router;
