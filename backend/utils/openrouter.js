// const fetch = require('node-fetch'); // Using global fetch (Node 18+)

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const MODEL = "amazon/nova-2-lite-v1:free";

/**
 * Generates content using OpenRouter API.
 * @param {string} prompt - The user prompt.
 * @param {object} options - Additional options like reasoning.
 * @returns {Promise<string>} - The generated content.
 */
async function generateContent(prompt) {
    if (!OPENROUTER_API_KEY) {
        console.error("OPENROUTER_API_KEY is missing in .env");
        return "Error: AI service not configured.";
    }

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "model": MODEL,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                "reasoning": { "enabled": true }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`OpenRouter API Error: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        if (result.choices && result.choices.length > 0) {
            return result.choices[0].message.content;
        } else {
            throw new Error("No content generated.");
        }

    } catch (error) {
        console.error("Error calling OpenRouter:", error);
        return `Error generating content: ${error.message}`;
    }
}

module.exports = { generateContent };
