const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
});

async function loadTests() {
    const client = await pool.connect();

    try {
        // Read tests JSON
        const testsPath = path.join(__dirname, '../../sample_data/sample_tests.json');
        const testsData = JSON.parse(fs.readFileSync(testsPath, 'utf8'));

        console.log('Loading test questions...\n');

        await client.query('BEGIN');

        let totalQuestions = 0;

        for (const test of testsData.tests) {
            console.log(`Loading test: ${test.test_id} (${test.module_title})`);

            for (const question of test.questions) {
                await client.query(`
                    INSERT INTO test_questions (
                        test_id, module_id, question_id, type, question_text,
                        options, correct_answer, short_rationale, hint
                    )
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                    ON CONFLICT (question_id) DO UPDATE
                    SET question_text = EXCLUDED.question_text,
                        correct_answer = EXCLUDED.correct_answer
                `, [
                    test.test_id,
                    test.module_id,
                    question.question_id,
                    question.type,
                    question.question_text,
                    question.options ? JSON.stringify(question.options) : null,
                    question.correct_answer,
                    question.short_rationale,
                    question.hint
                ]);

                totalQuestions++;
            }

            console.log(`  ✓ Loaded ${test.questions.length} questions`);
        }

        await client.query('COMMIT');
        console.log(`\n✅ Successfully loaded ${totalQuestions} questions from ${testsData.tests.length} tests`);
        console.log(`\nBreakdown:`);
        console.log(`  - MCQ questions: ${testsData.test_metadata.question_type_distribution.mcq}`);
        console.log(`  - Short answer questions: ${testsData.test_metadata.question_type_distribution.short_answer}`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error loading tests:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

loadTests();
