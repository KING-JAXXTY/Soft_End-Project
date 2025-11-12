// Simple Node.js test for Gemini grammar checker
const fetch = require('node-fetch');

const GEMINI_API_KEYS = [
    'AIzaSyApbgd0-jvPN7rptLZXtMN4-CI7bNEONPE',
    'AIzaSyDOmX7NlPotb2PDnIGPMGcUh5puhz3qp9M'
];
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function grammarCheck(postContent) {
    const prompt = `Fix the grammar, spelling, and improve the clarity of this text. Keep the same meaning and tone. Return ONLY the corrected text without any explanation or special characters like asterisks or hyphens:\n\n"${postContent}"\n\nCorrected text:`;
    for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
        const apiKey = GEMINI_API_KEYS[i];
        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini API Error Response:', errorText);
                continue;
            }
            const json = await response.json();
            let correctedText = json.candidates[0].content.parts[0].text || '';
            correctedText = correctedText
                .replace(/^['"]|['"]$/g, '')
                .replace(/\*\*/g, '')
                .replace(/\*/g, '')
                .replace(/^[\-\*]\s/gm, '')
                .trim();
            return correctedText;
        } catch (error) {
            console.error('Grammar check error:', error);
        }
    }
    return postContent;
}

(async () => {
    const testText = 'this is a test sentence with bad grammar. i hopes it works good.';
    const result = await grammarCheck(testText);
    console.log('Original:', testText);
    console.log('Corrected:', result);
})();
