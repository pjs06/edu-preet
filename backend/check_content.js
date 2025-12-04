const { Pool } = require('pg');
const dotenv = require('dotenv');
dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

async function checkContent() {
    try {
        const res = await pool.query('SELECT concept_id, path_type FROM ai_content_cache');
        console.log('Content in DB:', res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        pool.end();
    }
}

checkContent();
