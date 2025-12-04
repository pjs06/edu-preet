const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
});

async function loadCurriculum() {
    const client = await pool.connect();

    try {
        // Read curriculum JSON
        const curriculumPath = path.join(__dirname, '../../sample_data/sample_curriculum.json');
        const curriculum = JSON.parse(fs.readFileSync(curriculumPath, 'utf8'));

        console.log(`Loading curriculum: ${curriculum.title}`);

        await client.query('BEGIN');

        // Insert curriculum as chapters
        for (let i = 0; i < curriculum.modules.length; i++) {
            const module = curriculum.modules[i];

            // Map module to curriculum record (chapter)
            const result = await client.query(`
                INSERT INTO curriculum (
                    subject, grade, language, chapter_number, chapter_title, concepts
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `, [
                'Science',
                curriculum.grade,
                curriculum.language,
                i + 1,
                module.title,
                JSON.stringify([{
                    id: module.module_id,
                    name: module.title,
                    description: module.description,
                    order: i + 1,
                    learning_objectives: module.learning_objectives,
                    chunk_ids: module.chunk_ids,
                    estimated_time_seconds: module.estimated_time_seconds,
                    assessment: module.assessment,
                    prerequisites: module.prerequisites,
                    tags: module.tags
                }])
            ]);

            console.log(`  ✓ Loaded module ${i + 1}: ${module.title} (DB ID: ${result.rows[0].id})`);
        }

        await client.query('COMMIT');
        console.log(`\n✅ Successfully loaded ${curriculum.modules.length} modules`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error loading curriculum:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

loadCurriculum();
