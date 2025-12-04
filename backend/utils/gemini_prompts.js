/**
 * Gemini Prompt Templates for Adaptive Video Learning
 * 
 * This module exports functions to generate prompts for different types of educational content.
 * 
 * Persona: "Patient Tutor"
 * - Speaks simply and clearly
 * - Uses short sentences
 * - Encouraging and positive tone
 * - Never shames the student
 */

const SYSTEM_PERSONA = `
You are a patient, friendly, and encouraging tutor for a [GRADE] grade student.
Your goal is to explain complex topics simply, using clear language and short sentences.
You never make the student feel bad for not understanding.
You always end with a positive, encouraging remark.
`;

/**
 * Generates a prompt for the Main Path video script.
 * Focus: Formal explanation, clear definitions, step-by-step process.
 */
const generateMainScriptPrompt = (topic, grade, learningObjectives) => {
    return `
${SYSTEM_PERSONA.replace('[GRADE]', grade)}

TASK: Create a 5-minute educational video script for the topic: "${topic}".

LEARNING OBJECTIVES:
${learningObjectives.map(obj => `- ${obj}`).join('\n')}

SCRIPT FORMAT:
- [VISUAL]: Describe what should be shown on screen (diagrams, text, animations).
- [AUDIO]: Write the exact narration text for the tutor.

GUIDELINES:
1. Start with a clear hook to grab attention.
2. Define key terms simply.
3. Use a step-by-step logical flow.
4. Include 2-3 "Check for Understanding" pauses where you ask a rhetorical question.
5. Keep the tone formal but friendly.
6. Total word count should be approx 600-750 words (for ~5 mins).

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "title": "Video Title",
  "scenes": [
    {
      "visual": "Description of visual...",
      "audio": "Narration text...",
      "duration_seconds": 30
    }
  ]
}
`;
};

/**
 * Generates a prompt for Remedial Path 1 (Story-based).
 * Focus: Narrative format, relatable characters, everyday situations.
 */
const generateStoryScriptPrompt = (topic, grade, missedConcepts) => {
    return `
${SYSTEM_PERSONA.replace('[GRADE]', grade)}

TASK: Create a 6-minute remedial video script for the topic: "${topic}".
The student previously struggled with: ${missedConcepts.join(', ')}.

APPROACH: STORYTELLING
- Create a short story with relatable characters (e.g., Rohan and his grandma, or Maya and her garden).
- The characters should encounter a problem that is solved by understanding the concept.
- Weave the educational content naturally into the dialogue and plot.
- Avoid heavy jargon; focus on the *why* and *how* through the story.

SCRIPT FORMAT:
- [VISUAL]: Describe the scene, characters, and actions.
- [AUDIO]: Dialogue and narration.

GUIDELINES:
1. Introduce characters quickly.
2. Present a relatable conflict related to "${topic}".
3. Use the story to explain the "missed concepts" specifically.
4. End with a resolution that reinforces the learning.
5. Tone: Warm, engaging, narrative.

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "title": "Story Video Title",
  "characters": ["Name 1", "Name 2"],
  "scenes": [
    {
      "visual": "Scene description...",
      "audio": "Dialogue/Narration...",
      "duration_seconds": 45
    }
  ]
}
`;
};

/**
 * Generates a prompt for Remedial Path 2 (Analogy-based).
 * Focus: Strong analogies, simplified concepts, interactive prompts.
 */
const generateAnalogyScriptPrompt = (topic, grade, missedConcepts) => {
    return `
${SYSTEM_PERSONA.replace('[GRADE]', grade)}

TASK: Create a 7-minute remedial video script for the topic: "${topic}".
The student is struggling with: ${missedConcepts.join(', ')}.

APPROACH: DEEP ANALOGY
- Use ONE strong, extended analogy to explain the entire concept (e.g., "A cell is like a factory", "Current is like water flow").
- Map every part of the concept to a part of the analogy.
- Break it down into very small, digestible chunks.

SCRIPT FORMAT:
- [VISUAL]: Describe the analogy visuals (e.g., factory gears, water pipes).
- [AUDIO]: Narration explaining the connection.

GUIDELINES:
1. Introduce the analogy immediately.
2. Explicitly state: "Think of [Concept] like [Analogy]..."
3. Revisit the analogy for each "missed concept".
4. Include 3-4 interactive prompts: "Can you guess what part of the factory this is? Pause and think."
5. Tone: Very patient, slow-paced, illustrative.

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "title": "Analogy Video Title",
  "main_analogy": "Description of the core analogy",
  "scenes": [
    {
      "visual": "Visual description...",
      "audio": "Narration...",
      "duration_seconds": 45
    }
  ]
}
`;
};

/**
 * Generates a prompt for Adaptive Test Generation.
 * Focus: Generate questions based on the script, with metadata.
 */
const generateTestPrompt = (topic, grade, scriptContent, difficulty = 'medium') => {
    return `
${SYSTEM_PERSONA.replace('[GRADE]', grade)}

TASK: Generate a 3-question mini-test for the topic: "${topic}".
Base the questions strictly on the provided script content to ensure fairness.

SCRIPT CONTEXT:
${JSON.stringify(scriptContent).substring(0, 5000)}... (truncated for length if needed)

DIFFICULTY: ${difficulty}

GUIDELINES:
1. Create 3 Multiple Choice Questions (MCQs).
2. Questions should test understanding, not just memory.
3. For "hard" difficulty, use scenario-based questions.
4. For "easy" difficulty, use direct recall questions.
5. Provide a "hint" for each question that guides them without giving the answer.
6. Provide a "short_rationale" for the correct answer.

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "test_id": "generated_test_${Date.now()}",
  "questions": [
    {
      "question_id": "q1",
      "text": "Question text...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_option_index": 0,
      "hint": "Helpful hint...",
      "rationale": "Explanation of why it's correct..."
    }
  ]
}
`;
};

module.exports = {
    generateMainScriptPrompt,
    generateStoryScriptPrompt,
    generateAnalogyScriptPrompt,
    generateTestPrompt
};
