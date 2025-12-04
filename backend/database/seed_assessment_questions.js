const { Pool } = require('pg');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') || process.env.DATABASE_URL.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
});

const questions = [
    // SECTION 1: Learning Style (VARK)
    {
        question_order: 1,
        question_text: "Imagine you want to learn how to make a paper airplane. What would help you the most?",
        question_category: "learning_style",
        question_type: "scenario",
        options: [
            { text: "Watch a video showing each step", scores: { visual: 3, auditory: 1 } },
            { text: "Listen to someone explain how to fold it", scores: { auditory: 3, visual: 0 } },
            { text: "Read instructions with pictures", scores: { reading_writing: 3, visual: 2 } },
            { text: "Try folding it yourself while someone guides you", scores: { kinesthetic: 3, auditory: 1 } }
        ]
    },
    {
        question_order: 2,
        question_text: "In class, you remember things best when...",
        question_category: "learning_style",
        question_type: "preference",
        options: [
            { text: "The teacher draws diagrams on the board", scores: { visual: 3 } },
            { text: "The teacher explains things out loud", scores: { auditory: 3 } },
            { text: "You write notes in your notebook", scores: { reading_writing: 3 } },
            { text: "You do an activity or experiment", scores: { kinesthetic: 3 } }
        ]
    },
    {
        question_order: 3,
        question_text: "You're learning about plants. What sounds most fun?",
        question_category: "learning_style",
        question_type: "preference",
        options: [
            { text: "Looking at colorful pictures and charts", scores: { visual: 3 } },
            { text: "Listening to a story about a plant's life", scores: { auditory: 3 } },
            { text: "Reading a chapter in your textbook", scores: { reading_writing: 3 } },
            { text: "Planting a seed and watching it grow", scores: { kinesthetic: 3 } }
        ]
    },
    {
        question_order: 4,
        question_text: "When you're trying to remember something important...",
        question_category: "learning_style",
        question_type: "scenario",
        options: [
            { text: "I picture it in my mind like a movie", scores: { visual: 3 } },
            { text: "I repeat it to myself out loud", scores: { auditory: 3 } },
            { text: "I write it down multiple times", scores: { reading_writing: 3 } },
            { text: "I walk around or move while thinking", scores: { kinesthetic: 3 } }
        ]
    },
    {
        question_order: 5,
        question_text: "If you could choose, you'd rather...",
        question_category: "learning_style",
        question_type: "preference",
        options: [
            { text: "Watch an animated video about science", scores: { visual: 2, auditory: 1 } },
            { text: "Listen to an interesting podcast or audiobook", scores: { auditory: 3 } },
            { text: "Read a fun comic book about history", scores: { reading_writing: 2, visual: 1 } },
            { text: "Play an educational game where you move around", scores: { kinesthetic: 3 } }
        ]
    },
    {
        question_order: 6,
        question_text: "Your friend is absent. How would you explain today's math lesson to them?",
        question_category: "learning_style",
        question_type: "scenario",
        options: [
            { text: "I'd draw the problem and show them step-by-step", scores: { visual: 3 } },
            { text: "I'd call and explain it over the phone", scores: { auditory: 3 } },
            { text: "I'd write the explanation in a message", scores: { reading_writing: 3 } },
            { text: "I'd meet them and solve a problem together", scores: { kinesthetic: 3 } }
        ]
    },

    // SECTION 2: Mindset (Growth vs. Fixed)
    {
        question_order: 7,
        question_text: "When you get a difficult math problem wrong...",
        question_category: "mindset",
        question_type: "scenario",
        options: [
            { text: "I'm just not good at math", scores: { fixed_mindset: 3, confidence: -1 } },
            { text: "I need to practice more to get better", scores: { growth_mindset: 3, resilience: 2 } },
            { text: "This problem was too hard and unfair", scores: { fixed_mindset: 2, external_locus: 2 } },
            { text: "Let me try a different way to solve it", scores: { growth_mindset: 3, resilience: 3 } }
        ]
    },
    {
        question_order: 8,
        question_text: "Your friend learns something faster than you. You think...",
        question_category: "mindset",
        question_type: "scenario",
        options: [
            { text: "They're smarter than me", scores: { fixed_mindset: 3, peer_sensitivity: 2 } },
            { text: "They've probably practiced more. I can catch up!", scores: { growth_mindset: 3, peer_sensitivity: -1 } },
            { text: "Everyone learns at different speeds, that's okay", scores: { growth_mindset: 2, confidence: 1 } },
            { text: "It's not fair, they're just lucky", scores: { fixed_mindset: 2, external_locus: 2 } }
        ]
    },
    {
        question_order: 9,
        question_text: "You're learning to ride a bicycle and keep falling. You...",
        question_category: "mindset",
        question_type: "scenario",
        options: [
            { text: "I'll never learn this, I should give up", scores: { fixed_mindset: 3, resilience: -2 } },
            { text: "I'll keep trying until I get it!", scores: { growth_mindset: 3, resilience: 3 } },
            { text: "Maybe I'm just not meant to ride bikes", scores: { fixed_mindset: 3 } },
            { text: "Let me watch how others do it first", scores: { growth_mindset: 2, strategic_thinking: 2 } }
        ]
    },
    {
        question_order: 10,
        question_text: "Your teacher says 'Great job!' on your homework. You think...",
        question_category: "mindset",
        question_type: "scenario",
        options: [
            { text: "I'm smart!", scores: { fixed_mindset: 2, extrinsic_motivation: 2 } },
            { text: "My hard work paid off!", scores: { growth_mindset: 3, intrinsic_motivation: 2 } },
            { text: "I got lucky with an easy assignment", scores: { fixed_mindset: 2, confidence: -1 } },
            { text: "I'm getting better at this subject!", scores: { growth_mindset: 3, intrinsic_motivation: 1 } }
        ]
    },
    {
        question_order: 11,
        question_text: "If you could choose...",
        question_category: "mindset",
        question_type: "preference",
        options: [
            { text: "I'd rather do something I'm already good at", scores: { fixed_mindset: 3, comfort_zone: 3 } },
            { text: "I'd rather try something new and challenging", scores: { growth_mindset: 3, adventure: 2 } },
            { text: "It depends on my mood", scores: { balanced: 2 } },
            { text: "I'd do whatever my friends are doing", scores: { peer_influenced: 3, social_motivation: 2 } }
        ]
    },

    // SECTION 3: Motivation & Confidence
    {
        question_order: 12,
        question_text: "What makes you most excited to learn?",
        question_category: "motivation",
        question_type: "preference",
        options: [
            { text: "Getting good grades and making my parents proud", scores: { extrinsic_motivation: 3 } },
            { text: "Understanding how things work", scores: { intrinsic_motivation: 3 } },
            { text: "Being the best in class", scores: { competition_drive: 3, extrinsic_motivation: 1 } },
            { text: "When learning feels like playing a game", scores: { intrinsic_motivation: 2, gamification_preference: 3 } }
        ]
    },
    {
        question_order: 13,
        question_text: "You're stuck on a problem. What do you do first?",
        question_category: "motivation",
        question_type: "scenario",
        options: [
            { text: "Immediately raise my hand and ask the teacher", scores: { help_seeking_comfort: 3, dependent_learner: 3 } },
            { text: "Try to figure it out on my own for a while", scores: { independent_learner: 3, confidence: 2 } },
            { text: "Look at what my classmates are doing", scores: { peer_dependent: 3, confidence: -1 } },
            { text: "Search online or in books for hints", scores: { independent_learner: 2, research_skills: 2 } }
        ]
    },
    {
        question_order: 14,
        question_text: "Before a test, you feel...",
        question_category: "motivation",
        question_type: "scenario",
        options: [
            { text: "Very nervous, worried I'll fail", scores: { test_anxiety: 3, confidence: -2 } },
            { text: "A little nervous but mostly confident", scores: { healthy_anxiety: 1, confidence: 2 } },
            { text: "Excited to show what I know!", scores: { confidence: 3, low_anxiety: 3 } },
            { text: "I don't really care about tests", scores: { low_motivation: 3, disengaged: 3 } }
        ]
    },
    {
        question_order: 15,
        question_text: "You see a big, thick textbook. Your first thought is...",
        question_category: "motivation",
        question_type: "scenario",
        options: [
            { text: "This is going to be so boring", scores: { negative_association: 3, low_motivation: 2 } },
            { text: "I wonder what interesting things are in here", scores: { intrinsic_motivation: 3, curiosity: 3 } },
            { text: "This is too much to read", scores: { cognitive_overload: 2, confidence: -1 } },
            { text: "I'll read it if I have to", scores: { extrinsic_motivation: 2, dutiful: 2 } }
        ]
    },

    // SECTION 4: Attention & Processing
    {
        question_order: 16,
        question_text: "When watching videos or reading, you prefer...",
        question_category: "attention",
        question_type: "preference",
        options: [
            { text: "Short videos (3-5 minutes each)", scores: { preferred_chunk: "short", sustained_attention: "low" } },
            { text: "Medium videos (5-8 minutes)", scores: { preferred_chunk: "medium", sustained_attention: "moderate" } },
            { text: "Longer videos (8-12 minutes)", scores: { preferred_chunk: "long", sustained_attention: "high" } },
            { text: "I don't mind, as long as it's interesting", scores: { flexible_attention: 3 } }
        ]
    },
    {
        question_order: 17,
        question_text: "You're learning something new. Do you...",
        question_category: "processing",
        question_type: "preference",
        options: [
            { text: "Understand it quickly and want to move fast", scores: { processing_speed: "fast", sequential: "low" } },
            { text: "Like to take your time and think deeply", scores: { processing_speed: "deliberate", detail_oriented: "high" } },
            { text: "Need to hear/see it a few times to get it", scores: { processing_speed: "moderate", repetition_needed: 2 } },
            { text: "Like to see the big picture before details", scores: { holistic_learner: 3, big_picture: 3 } }
        ]
    },
    {
        question_order: 18,
        question_text: "During a 30-minute lesson, you...",
        question_category: "attention",
        question_type: "scenario",
        options: [
            { text: "Start feeling tired after 10-15 minutes", scores: { sustained_attention: 15 } },
            { text: "Can focus for about 20-25 minutes", scores: { sustained_attention: 25 } },
            { text: "Can pay attention the whole time", scores: { sustained_attention: 30 } },
            { text: "It depends on how interesting the topic is", scores: { interest_driven: 3 } }
        ]
    },

    // SECTION 5: Emotional & Social
    {
        question_order: 19,
        question_text: "When you make a mistake in front of others...",
        question_category: "emotional",
        question_type: "scenario",
        options: [
            { text: "I feel really embarrassed and upset", scores: { failure_resilience: "low", emotional_sensitivity: 2 } },
            { text: "I feel a bit silly but it's okay, everyone makes mistakes", scores: { failure_resilience: "high", healthy_perspective: 3 } },
            { text: "I feel bad for a while but then I get over it", scores: { failure_resilience: "moderate" } },
            { text: "I don't really care what others think", scores: { confidence: 3, peer_sensitivity: "low" } }
        ]
    },
    {
        question_order: 20,
        question_text: "You don't understand something. Would you...",
        question_category: "social",
        question_type: "scenario",
        options: [
            { text: "Stay quiet and pretend I understand", scores: { help_seeking_comfort: "low", fear_of_judgment: 2 } },
            { text: "Raise my hand and ask right away", scores: { help_seeking_comfort: "high", confidence: 2 } },
            { text: "Ask the teacher privately after class", scores: { help_seeking_comfort: "moderate", private_preference: 3 } },
            { text: "Ask a friend to explain it later", scores: { peer_preferred: 3, social_comfort: 2 } }
        ]
    }
];

async function seedAssessmentQuestions() {
    const client = await pool.connect();
    try {
        console.log('Seeding assessment questions...');
        await client.query('BEGIN');

        // Clear existing questions to avoid duplicates if re-running
        await client.query('DELETE FROM assessment_questions');

        for (const q of questions) {
            await client.query(`
                INSERT INTO assessment_questions (
                    question_order, question_text, question_category, question_type, options
                ) VALUES ($1, $2, $3, $4, $5)
            `, [q.question_order, q.question_text, q.question_category, q.question_type, JSON.stringify(q.options)]);
        }

        await client.query('COMMIT');
        console.log(`✅ Successfully seeded ${questions.length} assessment questions.`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding assessment questions:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

seedAssessmentQuestions();
