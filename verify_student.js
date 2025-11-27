const { Pool } = require('pg');
const http = require('http');
require('dotenv').config({ path: './backend/.env' });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function verify() {
    try {
        // 1. Get a student ID
        const res = await pool.query('SELECT id FROM students LIMIT 1');
        if (res.rows.length === 0) {
            console.log('No students found in DB to test.');
            return;
        }
        const studentId = res.rows[0].id;
        console.log(`Found student ID: ${studentId}`);

        // 2. Call the API
        http.get(`http://localhost:5001/api/students/${studentId}`, (apiRes) => {
            let data = '';
            apiRes.on('data', (chunk) => { data += chunk; });
            apiRes.on('end', () => {
                console.log('API Response Status:', apiRes.statusCode);
                console.log('API Response Body:', data);
                pool.end();
            });
        }).on('error', (err) => {
            console.error('API Error:', err.message);
            pool.end();
        });

    } catch (err) {
        console.error('DB Error:', err);
        pool.end();
    }
}

verify();
