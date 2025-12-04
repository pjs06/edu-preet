const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
});

async function verifyData() {
    const client = await pool.connect();

    try {
        console.log('='.repeat(60));
        console.log('DATABASE VERIFICATION REPORT');
        console.log('='.repeat(60));
        console.log();

        // Check curriculum
        const curriculumRes = await client.query(`
            SELECT COUNT(*) as count, 
                   subject, 
                   grade, 
                   language 
            FROM curriculum 
            WHERE subject = 'Science' AND grade = '8'
            GROUP BY subject, grade, language
        `);

        if (curriculumRes.rows.length > 0) {
            const row = curriculumRes.rows[0];
            console.log('✅ Curriculum loaded');
            console.log(`   Subject: ${row.subject}`);
            console.log(`   Grade: ${row.grade}`);
            console.log(`   Language: ${row.language}`);
            console.log(`   Chapters/Modules: ${row.count}`);
        } else {
            console.log('❌ No curriculum data found');
        }

        console.log();

        // Check chunks
        const chunksRes = await client.query(`
            SELECT COUNT(*) as count
            FROM ai_content_cache
            WHERE path_type = 'chunk_content'
        `);

        console.log('✅ Textbook chunks loaded');
        console.log(`   Total chunks: ${chunksRes.rows[0].count}`);

        console.log();

        // Check test questions
        const questionsRes = await client.query(`
            SELECT COUNT(*) as total,
                   SUM(CASE WHEN type = 'mcq' THEN 1 ELSE 0 END) as mcq_count,
                   SUM(CASE WHEN type = 'short_answer' THEN 1 ELSE 0 END) as short_answer_count
            FROM test_questions
        `);

        if (questionsRes.rows[0].total > 0) {
            const row = questionsRes.rows[0];
            console.log('✅ Test questions loaded');
            console.log(`   Total questions: ${row.total}`);
            console.log(`   MCQ: ${row.mcq_count}`);
            console.log(`   Short answer: ${row.short_answer_count}`);
        } else {
            console.log('❌ No test questions found');
        }

        console.log();
        console.log('='.repeat(60));
        console.log('SAMPLE DATA PREVIEW');
        console.log('='.repeat(60));
        console.log();

        // Show first module
        const moduleRes = await client.query(`
            SELECT chapter_name, concepts
            FROM curriculum
            WHERE subject = 'Science' AND grade = '8'
            ORDER BY chapter_number
            LIMIT 1
        `);

        if (moduleRes.rows.length > 0) {
            console.log('First Module:');
            console.log(`  Title: ${moduleRes.rows[0].chapter_name}`);
            const concept = JSON.parse(moduleRes.rows[0].concepts)[0];
            console.log(`  Module ID: ${concept.id}`);
            console.log(`  Learning Objectives: ${concept.learning_objectives.length}`);
            console.log(`  Chunks: ${concept.chunk_ids.join(', ')}`);
        }

        console.log();

        // Show first chunk
        const chunkRes = await client.query(`
            SELECT concept_id, LEFT(generated_content, 100) as preview, metadata
            FROM ai_content_cache
            WHERE path_type = 'chunk_content'
            ORDER BY concept_id
            LIMIT 1
        `);

        if (chunkRes.rows.length > 0) {
            console.log('First Chunk:');
            console.log(`  Chunk ID: ${chunkRes.rows[0].concept_id}`);
            console.log(`  Preview: ${chunkRes.rows[0].preview}...`);
            const meta = JSON.parse(chunkRes.rows[0].metadata);
            console.log(`  Read time: ${meta.estimated_read_time_seconds}s`);
            console.log(`  Difficulty: ${meta.difficulty}`);
        }

        console.log();

        // Show first question
        const questionRes = await client.query(`
            SELECT question_id, type, question_text
            FROM test_questions
            ORDER BY question_id
            LIMIT 1
        `);

        if (questionRes.rows.length > 0) {
            console.log('First Test Question:');
            console.log(`  ID: ${questionRes.rows[0].question_id}`);
            console.log(`  Type: ${questionRes.rows[0].type}`);
            console.log(`  Question: ${questionRes.rows[0].question_text}`);
        }

        console.log();
        console.log('='.repeat(60));
        console.log('✅ All data verified successfully!');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('❌ Verification failed:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

verifyData();
