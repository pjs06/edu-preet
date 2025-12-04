const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
});

async function addTestQuestionsTable() {
    const client = await pool.connect();
    try {
        console.log('Creating test_questions table...');

        await client.query(`
            CREATE TABLE IF NOT EXISTS test_questions (
                id SERIAL PRIMARY KEY,
                test_id VARCHAR(100) NOT NULL,
                module_id VARCHAR(100) NOT NULL,
                question_id VARCHAR(100) UNIQUE NOT NULL,
                type VARCHAR(50) NOT NULL,
                question_text TEXT NOT NULL,
                options JSONB,
                correct_answer TEXT NOT NULL,
                short_rationale TEXT,
                hint TEXT,
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log('Creating indexes...');

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_test_questions_module ON test_questions(module_id);
        `);

        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_test_questions_test ON test_questions(test_id);
        `);

        console.log('✅ test_questions table created successfully');

    } catch (err) {
        console.error('❌ Error creating table:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

addTestQuestionsTable();
