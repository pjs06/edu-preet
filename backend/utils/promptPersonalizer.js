/**
 * Generates a personalized prompt based on the student's learning profile.
 * 
 * @param {string} basePrompt - The core instructional prompt (e.g., "Explain photosynthesis")
 * @param {object} studentProfile - The student's profile from the database
 * @returns {string} The personalized prompt with modifiers
 */
function generatePersonalizedPrompt(basePrompt, studentProfile) {
    const {
        primaryLearningStyle,
        mindsetType,
        idealContentStyle, // Note: DB uses ideal_content_style, mapping needed if passed directly
        supportLevel,
        processingSpeed
    } = studentProfile;

    // Map DB keys to expected keys if necessary, or ensure caller passes correct keys
    // Assuming caller passes camelCase keys derived from DB snake_case

    let promptModifiers = [];

    // 1. Learning Style Modifiers
    if (primaryLearningStyle && primaryLearningStyle.includes('visual')) {
        promptModifiers.push(`
        Use vivid visual descriptions. Describe colors, shapes, and spatial relationships.
        Suggest "imagine this picture..." frequently.
        Recommend diagrams and charts.
      `);
    }

    if (primaryLearningStyle && primaryLearningStyle.includes('auditory')) {
        promptModifiers.push(`
        Use rhythmic language and memorable phrases.
        Include sound-based examples (e.g., "listen to this idea...").
        Suggest saying things out loud or creating songs/rhymes.
      `);
    }

    if (primaryLearningStyle && primaryLearningStyle.includes('kinesthetic')) {
        promptModifiers.push(`
        Emphasize hands-on activities and physical movement.
        Use action verbs: "try this", "move", "touch", "build".
        Relate concepts to sports, dance, or physical experiences.
      `);
    }

    if (primaryLearningStyle && primaryLearningStyle.includes('reading_writing') || primaryLearningStyle && primaryLearningStyle.includes('readingWriting')) {
        promptModifiers.push(`
        Encourage note-taking and written summaries.
        Provide lists, bullet points, and structured text.
        Suggest reading related materials.
      `);
    }

    // 2. Mindset Modifiers
    if (mindsetType === 'fixed_leaning') {
        promptModifiers.push(`
        CRITICAL: Emphasize effort over innate ability.
        Use phrases like "you're learning" instead of "you're smart".
        Normalize mistakes: "Many students find this tricky at first".
        Celebrate progress, not just outcomes.
      `);
    }

    if (mindsetType === 'strong_growth') {
        promptModifiers.push(`
        This student embraces challenges! Offer deeper explorations.
        Use phrases like "Ready for a challenge?" and "Let's push further".
        Emphasize skill development and mastery.
      `);
    }

    // 3. Content Style Modifiers
    if (idealContentStyle === 'story_narrative') {
        promptModifiers.push(`
        Frame all explanations as stories with characters.
        Use narrative arc: problem → journey → solution.
        Make concepts relatable through everyday scenarios.
        Example: "Meet Aarav, who discovered something amazing..."
      `);
    }

    if (idealContentStyle === 'gamified_challenge') {
        promptModifiers.push(`
        Frame learning as levels, quests, and achievements.
        Use competitive language: "Can you solve this?", "Level up!".
        Include points, badges, and progress tracking.
        Make it feel like a game, not a lesson.
      `);
    }

    if (idealContentStyle === 'visual_discovery') {
        promptModifiers.push(`
        Lead with "What do you see?" and observation.
        Use discovery-based questions.
        Emphasize visual patterns and relationships.
      `);
    }

    // 4. Support Level Modifiers
    if (supportLevel === 'high_encouragement') {
        promptModifiers.push(`
        CRITICAL: Provide frequent positive reinforcement.
        After every explanation: "You're doing great!"
        When student struggles: "I know this is tricky, but I believe in you!"
        Use warm, supportive tone throughout.
        Normalize difficulty: "This is a tough concept, even adults find it hard!"
      `);
    }

    if (supportLevel === 'minimal_encouragement') {
        promptModifiers.push(`
        This student is confident. Be direct and efficient.
        Skip excessive encouragement, focus on content.
        Challenge them more, coddle them less.
      `);
    }

    // 5. Processing Speed Modifiers
    if (processingSpeed === 'deliberate') {
        promptModifiers.push(`
        Break concepts into VERY small steps.
        Pause frequently with: "Let's take a moment to think about that..."
        Repeat key points 2-3 times in different ways.
        Ask comprehension checks every minute.
      `);
    }

    if (processingSpeed === 'fast') {
        promptModifiers.push(`
        This student processes quickly. Be concise.
        Skip excessive repetition unless they request it.
        Move through concepts at a brisk pace.
        Offer "deep dive" options for curious learners.
      `);
    }

    // Combine all modifiers
    const personalizedPrompt = `
      ${basePrompt}
      
      PERSONALIZATION INSTRUCTIONS:
      Student Profile: ${primaryLearningStyle} learner, ${mindsetType} mindset, ${supportLevel} support needed.
      
      ${promptModifiers.join('\n\n')}
      
      Adjust your teaching style according to these instructions while maintaining accuracy and clarity.
    `;

    return personalizedPrompt;
}

module.exports = { generatePersonalizedPrompt };
