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

// Public Routes (Before Auth Middleware)
app.get('/', (req, res) => {
    res.send('Educational Platform API is running');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/debug-env', (req, res) => {
    const dbUrl = process.env.DATABASE_URL;
    res.json({
        hasDbUrl: !!dbUrl,
        dbUrlMasked: dbUrl ? dbUrl.replace(/:[^:@]*@/, ':****@') : null,
        envPort: process.env.PORT,
        nodeEnv: process.env.NODE_ENV
    });
});

// Routes
const { authenticateJWT, trackActivity } = require('./middleware/authMiddleware');

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));

app.use('/api/content', require('./routes/content_generator'));
app.use('/api/learning', require('./routes/learning'));
app.use('/api/curriculum', require('./routes/curriculum'));

// Protected Routes Middleware
// Apply to all subsequent /api routes
app.use('/api', authenticateJWT, trackActivity);

app.use('/api/students', require('./routes/students'));

app.use('/api/sessions', require('./routes/sessions'));
app.use('/api/adaptive', require('./routes/adaptive'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/analytics', require('./routes/analytics'));



// Public Routes (Before Auth Middleware)
app.get('/', (req, res) => {
    res.send('Educational Platform API is running');
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/debug-env', (req, res) => {
    const dbUrl = process.env.DATABASE_URL;
    res.json({
        hasDbUrl: !!dbUrl,
        dbUrlMasked: dbUrl ? dbUrl.replace(/:[^:@]*@/, ':****@') : null,
        envPort: process.env.PORT,
        nodeEnv: process.env.NODE_ENV
    });
});

// Start Server
// Start Server
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;


