const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function migrate() {
    try {
        console.log('Adding missing columns to learning_assessments...');

        // Add big_picture_score
        try {
            await pool.query('ALTER TABLE learning_assessments ADD COLUMN big_picture_score INTEGER');
            console.log('Added big_picture_score column');
        } catch (err) {
            if (err.code === '42701') { // duplicate_column
                console.log('big_picture_score column already exists');
            } else {
                throw err;
            }
        }

        // Add peer_comparison_sensitivity
        try {
            await pool.query('ALTER TABLE learning_assessments ADD COLUMN peer_comparison_sensitivity INTEGER');
            console.log('Added peer_comparison_sensitivity column');
        } catch (err) {
            if (err.code === '42701') { // duplicate_column
                console.log('peer_comparison_sensitivity column already exists');
            } else {
                throw err;
            }
        }

        console.log('Migration completed successfully!');
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        pool.end();
    }
}

migrate();
