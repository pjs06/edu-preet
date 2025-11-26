const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Pool } = require('pg');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const { pool } = require('./db');

// Test database connection on startup
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error', err.stack);
    } else {
        console.log('Database connected successfully');
    }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/curriculum', require('./routes/curriculum'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/adaptive', require('./routes/adaptive'));
app.use('/api/ai', require('./routes/ai'));

app.get('/', (req, res) => {
    res.send('Educational Platform API is running');
});

// Start Server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});


