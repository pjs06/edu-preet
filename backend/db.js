const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const connectionString = process.env.DATABASE_URL;

let pool;

if (!connectionString) {
    console.error('DATABASE_URL is not defined in environment variables');
    // Create a mock pool that logs errors when used
    pool = {
        query: (text, params, callback) => {
            console.error('Cannot execute query: DATABASE_URL is missing');
            const err = new Error('Database not configured');
            if (callback) callback(err);
            return Promise.reject(err);
        },
        connect: () => {
            console.error('Cannot connect to database: DATABASE_URL is missing');
            return Promise.reject(new Error('Database not configured'));
        },
        on: () => { }
    };
} else {
    pool = new Pool({
        connectionString: connectionString,
        ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
    });

    pool.on('connect', () => {
        console.log('Connected to PostgreSQL database');
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle client', err);
        process.exit(-1);
    });
}

module.exports = { pool };
