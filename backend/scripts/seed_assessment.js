const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

const questions = [
    // --- SECTION 1: Learning Style (VARK) ---
    {
        order: 1,
        text: "Imagine you want to learn how to make a paper airplane. What would help you the most?",
        category: "learning_style",
        type: "scenario",
        options: [
            { text: "Watch a video showing each step", scores: { visual: 3, auditory: 1 } },
            { text: "Listen to someone explain how to fold it", scores: { auditory: 3 } },
            { text: "Read instructions with pictures", scores: { readingWriting: 3, visual: 2 } },
            { text: "Try folding it yourself while someone guides you", scores: { kinesthetic: 3, auditory: 1 } }
        ]
    },
    {
        order: 2,
        text: "In class, you remember things best when...",
        category: "learning_style",
        type: "preference",
        options: [
            { text: "The teacher draws diagrams on the board", scores: { visual: 3 } },
            { text: "The teacher explains things out loud", scores: { auditory: 3 } },
            { text: "You write notes in your notebook", scores: { readingWriting: 3 } },
            { text: "You do an activity or experiment", scores: { kinesthetic: 3 } }
        ]
    },
    {
        order: 3,
        text: "You're learning about plants. What sounds most fun?",
        category: "learning_style",
        type: "preference",
        options: [
            { text: "Looking at colorful pictures and charts", scores: { visual: 3 } },
            { text: "Listening to a story about a plant's life", scores: { auditory: 3 } },
            { text: "Reading a chapter in your textbook", scores: { readingWriting: 3 } },
            { text: "Planting a seed and watching it grow", scores: { kinesthetic: 3 } }
        ]
    },
    {
        order: 4,
        text: "When you're trying to remember something important...",
        category: "learning_style",
        type: "preference",
        options: [
            { text: "I picture it in my mind like a movie", scores: { visual: 3 } },
            { text: "I repeat it to myself out loud", scores: { auditory: 3 } },
            { text: "I write it down multiple times", scores: { readingWriting: 3 } },
            { text: "I walk around or move while thinking", scores: { kinesthetic: 3 } }
        ]
    },
    {
        order: 5,
        text: "If you could choose, you'd rather...",
        category: "learning_style",
        type: "preference",
        options: [
            { text: "Watch an animated video about science", scores: { visual: 2, auditory: 1 } },
            { text: "Listen to an interesting podcast or audiobook", scores: { auditory: 3 } },
            { text: "Read a fun comic book about history", scores: { readingWriting: 2, visual: 1 } },
            { text: "Play an educational game where you move around", scores: { kinesthetic: 3 } }
        ]
    },
    {
        order: 6,
        text: "Your friend is absent. How would you explain today's math lesson to them?",
        category: "learning_style",
        type: "scenario",
        options: [
            { text: "I'd draw the problem and show them step-by-step", scores: { visual: 3 } },
            { text: "I'd call and explain it over the phone", scores: { auditory: 3 } },
            { text: "I'd write the explanation in a message", scores: { readingWriting: 3 } },
            { text: "I'd meet them and solve a problem together", scores: { kinesthetic: 3 } }
        ]
    },

    // --- SECTION 2: Mindset (Growth vs. Fixed) ---
    {
        order: 7,
        text: "When you get a difficult math problem wrong...",
        category: "mindset",
        type: "scenario",
        options: [
            { text: "I'm just not good at math", scores: { fixedMindset: 3, confidenceLevel: -1 } },
            { text: "I need to practice more to get better", scores: { growthMindset: 3, failureResilience: 2 } },
            { text: "This problem was too hard and unfair", scores: { fixedMindset: 2 } },
            { text: "Let me try a different way to solve it", scores: { growthMindset: 3, failureResilience: 3 } }
        ]
    },
    {
        order: 8,
        text: "Your friend learns something faster than you. You think...",
        category: "mindset",
        type: "scenario",
        options: [
            { text: "They're smarter than me", scores: { fixedMindset: 3, peerComparisonSensitivity: 2 } },
            { text: "They've probably practiced more. I can catch up!", scores: { growthMindset: 3, peerComparisonSensitivity: -1 } },
            { text: "Everyone learns at different speeds, that's okay", scores: { growthMindset: 2, confidenceLevel: 1 } },
            { text: "It's not fair, they're just lucky", scores: { fixedMindset: 2 } }
        ]
    },
    {
        order: 9,
        text: "You're learning to ride a bicycle and keep falling. You...",
        category: "mindset",
        type: "scenario",
        options: [
            { text: "I'll never learn this, I should give up", scores: { fixedMindset: 3, failureResilience: -2 } },
            { text: "I'll keep trying until I get it!", scores: { growthMindset: 3, failureResilience: 3 } },
            { text: "Maybe I'm just not meant to ride bikes", scores: { fixedMindset: 3 } },
            { text: "Let me watch how others do it first", scores: { growthMindset: 2 } }
        ]
    },
    {
        order: 10,
        text: "Your teacher says 'Great job!' on your homework. You think...",
        category: "mindset",
        type: "scenario",
        options: [
            { text: "I'm smart!", scores: { fixedMindset: 2, extrinsicMotivation: 2 } },
            { text: "My hard work paid off!", scores: { growthMindset: 3, intrinsicMotivation: 2 } },
            { text: "I got lucky with an easy assignment", scores: { fixedMindset: 2, confidenceLevel: -1 } },
            { text: "I'm getting better at this subject!", scores: { growthMindset: 3, intrinsicMotivation: 1 } }
        ]
    },
    {
        order: 11,
        text: "If you could choose...",
        category: "mindset",
        type: "preference",
        options: [
            { text: "I'd rather do something I'm already good at", scores: { fixedMindset: 3 } },
            { text: "I'd rather try something new and challenging", scores: { growthMindset: 3 } },
            { text: "It depends on my mood", scores: { growthMindset: 1, fixedMindset: 1 } },
            { text: "I'd do whatever my friends are doing", scores: { extrinsicMotivation: 2 } }
        ]
    },

    // --- SECTION 3: Motivation & Confidence ---
    {
        order: 12,
        text: "What makes you most excited to learn?",
        category: "motivation",
        type: "preference",
        options: [
            { text: "Getting good grades and making my parents proud", scores: { extrinsicMotivation: 3 } },
            { text: "Understanding how things work", scores: { intrinsicMotivation: 3 } },
            { text: "Being the best in class", scores: { competitionDrive: 3, extrinsicMotivation: 1 } },
            { text: "When learning feels like playing a game", scores: { intrinsicMotivation: 2 } }
        ]
    },
    {
        order: 13,
        text: "You're stuck on a problem. What do you do first?",
        category: "motivation",
        type: "scenario",
        options: [
            { text: "Immediately raise my hand and ask the teacher", scores: { helpSeekingComfort: 3 } },
            { text: "Try to figure it out on my own for a while", scores: { confidenceLevel: 2 } },
            { text: "Look at what my classmates are doing", scores: { confidenceLevel: -1 } },
            { text: "Search online or in books for hints", scores: { confidenceLevel: 1 } }
        ]
    },
    {
        order: 14,
        text: "Before a test, you feel...",
        category: "motivation",
        type: "preference",
        options: [
            { text: "Very nervous, worried I'll fail", scores: { confidenceLevel: -2 } },
            { text: "A little nervous but mostly confident", scores: { confidenceLevel: 2 } },
            { text: "Excited to show what I know!", scores: { confidenceLevel: 3 } },
            { text: "I don't really care about tests", scores: { intrinsicMotivation: -1 } }
        ]
    },
    {
        order: 15,
        text: "You see a big, thick textbook. Your first thought is...",
        category: "motivation",
        type: "scenario",
        options: [
            { text: "This is going to be so boring", scores: { intrinsicMotivation: -1 } },
            { text: "I wonder what interesting things are in here", scores: { intrinsicMotivation: 3 } },
            { text: "This is too much to read", scores: { confidenceLevel: -1 } },
            { text: "I'll read it if I have to", scores: { extrinsicMotivation: 2 } }
        ]
    },

    // --- SECTION 4: Attention & Processing ---
    {
        order: 16,
        text: "When watching videos or reading, you prefer...",
        category: "attention",
        type: "preference",
        options: [
            { text: "Short videos (3-5 minutes each)", scores: { preferredChunkSize: 'short', sustainedAttentionMinutes: 5 } },
            { text: "Medium videos (5-8 minutes)", scores: { preferredChunkSize: 'medium', sustainedAttentionMinutes: 15 } },
            { text: "Longer videos (8-12 minutes)", scores: { preferredChunkSize: 'long', sustainedAttentionMinutes: 30 } },
            { text: "I don't mind, as long as it's interesting", scores: { sustainedAttentionMinutes: 20 } }
        ]
    },
    {
        order: 17,
        text: "You're learning something new. Do you...",
        category: "attention",
        type: "preference",
        options: [
            { text: "Understand it quickly and want to move fast", scores: { processingSpeed: 'fast' } },
            { text: "Like to take your time and think deeply", scores: { processingSpeed: 'deliberate', detailOriented: 3 } },
            { text: "Need to hear/see it a few times to get it", scores: { processingSpeed: 'moderate' } },
            { text: "Like to see the big picture before details", scores: { bigPicture: 3 } }
        ]
    },
    {
        order: 18,
        text: "During a 30-minute lesson, you...",
        category: "attention",
        type: "preference",
        options: [
            { text: "Start feeling tired after 10-15 minutes", scores: { sustainedAttentionMinutes: 15 } },
            { text: "Can focus for about 20-25 minutes", scores: { sustainedAttentionMinutes: 25 } },
            { text: "Can pay attention the whole time", scores: { sustainedAttentionMinutes: 30 } },
            { text: "It depends on how interesting the topic is", scores: { sustainedAttentionMinutes: 20 } }
        ]
    },

    // --- SECTION 5: Emotional & Social ---
    {
        order: 19,
        text: "When you make a mistake in front of others...",
        category: "emotional",
        type: "scenario",
        options: [
            { text: "I feel really embarrassed and upset", scores: { failureResilience: 1 } },
            { text: "I feel a bit silly but it's okay, everyone makes mistakes", scores: { failureResilience: 3 } },
            { text: "I feel bad for a while but then I get over it", scores: { failureResilience: 2 } },
            { text: "I don't really care what others think", scores: { confidenceLevel: 3 } }
        ]
    },
    {
        order: 20,
        text: "You don't understand something. Would you...",
        category: "emotional",
        type: "scenario",
        options: [
            { text: "Stay quiet and pretend I understand", scores: { helpSeekingComfort: 1 } },
            { text: "Raise my hand and ask right away", scores: { helpSeekingComfort: 3 } },
            { text: "Ask the teacher privately after class", scores: { helpSeekingComfort: 2 } },
            { text: "Ask a friend to explain it later", scores: { helpSeekingComfort: 2 } }
        ]
    }
];

async function seed() {
    try {
        await pool.query('BEGIN');

        // Clear existing questions
        await pool.query('DELETE FROM assessment_questions');

        // Insert new questions
        for (const q of questions) {
            await pool.query(`
                INSERT INTO assessment_questions (
                    question_order, question_text, question_category, question_type, options
                ) VALUES ($1, $2, $3, $4, $5)
            `, [q.order, q.text, q.category, q.type, JSON.stringify(q.options)]);
        }

        await pool.query('COMMIT');
        console.log('Successfully seeded 20 assessment questions!');
    } catch (err) {
        await pool.query('ROLLBACK');
        console.error('Error seeding questions:', err);
    } finally {
        pool.end();
    }
}

seed();
