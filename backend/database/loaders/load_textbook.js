const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');
const fs = require('fs');
const crypto = require('crypto');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
});

async function loadTextbookChunks() {
    const client = await pool.connect();

    try {
        // Read textbook JSON
        const textbookPath = path.join(__dirname, '../../sample_data/sample_textbook.json');
        const textbook = JSON.parse(fs.readFileSync(textbookPath, 'utf8'));

        console.log(`Loading textbook: ${textbook.title}`);
        console.log(`Total chunks: ${textbook.chunks.length}\n`);

        await client.query('BEGIN');

        for (const chunk of textbook.chunks) {
            // Create a hash for the prompt (since it's a required field)
            const promptHash = crypto
                .createHash('md5')
                .update(chunk.chunk_id)
                .digest('hex');

            // Store chunk in ai_content_cache
            await client.query(`
                INSERT INTO ai_content_cache (
                    concept_id, path_type, language, prompt_hash, generated_content, metadata
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (concept_id, path_type, language) DO UPDATE
                SET generated_content = EXCLUDED.generated_content,
                    metadata = EXCLUDED.metadata
            `, [
                chunk.chunk_id,        // concept_id stores chunk_id
                'chunk_content',       // path_type for chunks
                textbook.language,
                promptHash,
                chunk.text,
                JSON.stringify({
                    start_page: chunk.start_page,
                    end_page: chunk.end_page,
                    estimated_read_time_seconds: chunk.estimated_read_time_seconds,
                    keywords: chunk.keywords,
                    chapter: chunk.chapter,
                    difficulty: chunk.difficulty
                })
            ]);

            console.log(`  ✓ Loaded ${chunk.chunk_id} (${chunk.estimated_read_time_seconds}s, ${chunk.difficulty})`);
        }

        await client.query('COMMIT');
        console.log(`\n✅ Successfully loaded ${textbook.chunks.length} chunks`);

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error loading textbook:', err.message);
    } finally {
        client.release();
        await pool.end();
    }
}

loadTextbookChunks();
