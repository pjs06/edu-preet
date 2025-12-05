const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function seedCurriculum() {
    try {
        console.log('Seeding Class 9 Science Curriculum...');

        const dataPath = path.join(__dirname, '../sample_data/class9_science.json');
        const curriculumData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

        for (const chapter of curriculumData) {
            // Check if exists
            const existing = await pool.query(
                'SELECT id FROM curriculum WHERE subject = $1 AND grade = $2 AND chapter_number = $3',
                [chapter.subject, chapter.grade, chapter.chapter_number]
            );

            if (existing.rows.length > 0) {
                // Update
                await pool.query(
                    `UPDATE curriculum 
                     SET chapter_title = $1, concepts = $2, updated_at = NOW()
                     WHERE id = $3`,
                    [chapter.chapter_title, JSON.stringify(chapter.concepts), existing.rows[0].id]
                );
                console.log(`Updated Chapter ${chapter.chapter_number}: ${chapter.chapter_title}`);
            } else {
                // Insert
                await pool.query(
                    `INSERT INTO curriculum (subject, grade, chapter_number, chapter_title, concepts)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [chapter.subject, chapter.grade, chapter.chapter_number, chapter.chapter_title, JSON.stringify(chapter.concepts)]
                );
                console.log(`Inserted Chapter ${chapter.chapter_number}: ${chapter.chapter_title}`);
            }
        }

        console.log('Curriculum seeding completed successfully!');
    } catch (err) {
        console.error('Seeding failed:', err);
    } finally {
        pool.end();
    }
}

seedCurriculum();
