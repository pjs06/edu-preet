const { pool } = require('../db');

async function updateRetentionCohort(userId) {
    const client = await pool.connect();
    try {
        // Check if user has a cohort entry
        const checkCohort = await client.query(
            `SELECT * FROM user_retention_cohorts WHERE user_id = $1`,
            [userId]
        );

        if (checkCohort.rows.length === 0) {
            // Get user creation date to determine cohort month
            const userRes = await client.query('SELECT created_at, role FROM users WHERE id = $1', [userId]);
            if (userRes.rows.length === 0) return;

            const user = userRes.rows[0];
            const cohortMonth = new Date(user.created_at);
            cohortMonth.setDate(1); // First day of month
            cohortMonth.setHours(0, 0, 0, 0);

            await client.query(`
                INSERT INTO user_retention_cohorts (cohort_month, user_id, role, week_0)
                VALUES ($1, $2, $3, true)
            `, [cohortMonth, userId, user.role]);
        } else {
            // Update retention flags based on time since signup
            const userRes = await client.query('SELECT created_at FROM users WHERE id = $1', [userId]);
            const createdAt = new Date(userRes.rows[0].created_at);
            const now = new Date();
            const diffTime = Math.abs(now - createdAt);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let fieldToUpdate = null;

            // Week 0: 0-7 days (already set on creation usually, but good to ensure)
            // Week 1: 7-14 days
            if (diffDays > 7 && diffDays <= 14) fieldToUpdate = 'week_1';
            else if (diffDays > 14 && diffDays <= 21) fieldToUpdate = 'week_2';
            else if (diffDays > 21 && diffDays <= 28) fieldToUpdate = 'week_3';
            else if (diffDays > 28 && diffDays <= 35) fieldToUpdate = 'week_4';
            else if (diffDays > 30 && diffDays <= 60) fieldToUpdate = 'month_1';
            else if (diffDays > 60 && diffDays <= 90) fieldToUpdate = 'month_2';
            else if (diffDays > 90 && diffDays <= 120) fieldToUpdate = 'month_3';
            else if (diffDays > 180 && diffDays <= 210) fieldToUpdate = 'month_6';

            if (fieldToUpdate) {
                await client.query(`
                    UPDATE user_retention_cohorts 
                    SET ${fieldToUpdate} = true, last_seen_at = NOW()
                    WHERE user_id = $1
                 `, [userId]);
            } else {
                // Just update last_seen_at
                await client.query(`
                    UPDATE user_retention_cohorts 
                    SET last_seen_at = NOW()
                    WHERE user_id = $1
                 `, [userId]);
            }
        }
    } catch (err) {
        console.error('Error updating retention cohort:', err);
    } finally {
        client.release();
    }
}

module.exports = { updateRetentionCohort };
