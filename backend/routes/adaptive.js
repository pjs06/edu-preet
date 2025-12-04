const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// Evaluate Test Performance and Decide Next Step
router.post('/evaluate-test', async (req, res) => {
    let client;
    try {
        client = await pool.connect();
        const { studentId, sessionId, conceptId, currentPathType, answers, totalTimeTaken } = req.body;
        // answers: [{ questionId, isCorrect, timeTaken }]

        // 1. Calculate Metrics
        const totalQuestions = answers.length;
        const correctAnswers = answers.filter(a => a.isCorrect).length;
        const score = (correctAnswers / totalQuestions) * 100;

        // 2. Check History (Count previous failed attempts for this concept)
        const historyRes = await client.query(`
            SELECT COUNT(*) as fail_count 
            FROM concept_attempts 
            WHERE student_id = $1 AND concept_id = $2 AND checkpoint_passed = false
        `, [studentId, conceptId]);
        const failCount = parseInt(historyRes.rows[0].fail_count);

        // 3. Decision Tree Logic
        let decision = {};
        let passed = false;

        if (score >= 67 && totalTimeTaken < 180) {
            // ✅ SCENARIO 1: Success (Score >= 67% AND Time < 3 mins)
            decision = {
                scenario: 1,
                status: 'passed',
                nextStep: 'next_concept',
                pathType: 'main',
                message: 'Great job! Moving to the next concept.'
            };
            passed = true;
        } else if ((score >= 50 && score < 67) || (score >= 67 && totalTimeTaken > 240)) {
            // ⚠️ SCENARIO 2: Borderline (Score 50-66% OR Time > 4 mins)
            decision = {
                scenario: 2,
                status: 'borderline',
                nextStep: 'choice',
                options: [
                    { type: 'review', label: 'Review Concept (Recommended)', pathType: 'remedial_1' },
                    { type: 'continue', label: 'Continue Anyway', pathType: 'main' }
                ],
                message: 'You passed, but it took a while. Would you like to review?'
            };
            passed = true;
        } else {
            // Fail Scenarios
            if (failCount >= 1) {
                // 🔄 SCENARIO 4: Multiple Fails (2nd+ attempt)
                decision = {
                    scenario: 4,
                    status: 'failed',
                    nextStep: 'remediation',
                    pathType: 'remedial_2', // Analogy-heavy
                    message: 'Let\'s try a different approach with some analogies.'
                };
            } else {
                // ❌ SCENARIO 3: First Fail (Score < 50%)
                decision = {
                    scenario: 3,
                    status: 'failed',
                    nextStep: 'remediation',
                    pathType: 'remedial_1', // Story-based
                    message: 'Let\'s review this concept with a story.'
                };
            }
            passed = false;
        }

        await client.query('BEGIN');

        // 4. Log Attempt
        const attemptRes = await client.query(`
            INSERT INTO concept_attempts (
                session_id, student_id, concept_id, path_type, 
                checkpoint_passed, time_taken_seconds, path_taken
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id
        `, [
            sessionId,
            studentId,
            conceptId,
            currentPathType || 'main',
            passed,
            totalTimeTaken,
            JSON.stringify({ score, decision })
        ]);
        const attemptId = attemptRes.rows[0].id;

        // 5. Log Individual Responses (if answers provided)
        if (answers && answers.length > 0) {
            for (const ans of answers) {
                await client.query(`
                    INSERT INTO checkpoint_responses (
                        attempt_id, checkpoint_id, is_correct, time_taken_seconds
                    )
                    VALUES ($1, $2, $3, $4)
                `, [attemptId, ans.questionId || null, ans.isCorrect, ans.timeTaken || 0]);
            }
        }


        // 6. Update Session Metrics (Requested by User)
        // We need the learning_session_id. The frontend should ideally send it.
        // If not sent, we might miss this update or need to look it up.
        // Assuming frontend will send 'learningSessionId' in body.
        const { learningSessionId } = req.body;

        if (learningSessionId) {
            await client.query(`
                UPDATE learning_session_metrics
                SET 
                  checkpoints_attempted = checkpoints_attempted + $2,
                  checkpoints_passed = checkpoints_passed + $3,
                  updated_at = NOW()
                WHERE session_id = $1
              `, [learningSessionId, totalQuestions, correctAnswers]);
        }

        // 7. Track Feature Usage (Requested by User)
        await client.query(`
            INSERT INTO feature_usage (date, feature_name, total_uses, unique_users, success_count)
            VALUES (CURRENT_DATE, 'checkpoint_system', 1, 1, $1)
            ON CONFLICT (date, feature_name)
            DO UPDATE SET 
              total_uses = feature_usage.total_uses + 1,
              success_count = feature_usage.success_count + $1
        `, [passed ? 1 : 0]);

        await client.query('COMMIT');

        res.json({
            score,
            passed,
            decision
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send('Server Error');
    } finally {
        if (client) client.release();
    }
});

module.exports = router;
