const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

// Use multiple API keys for round-robin load distribution
const GEMINI_API_KEYS = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2
].filter(key => key); // Remove undefined keys

// Track which key to use (round-robin)
let currentKeyIndex = 0;

const getNextApiKey = () => {
    if (GEMINI_API_KEYS.length === 0) {
        throw new Error('No Gemini API keys configured');
    }
    const key = GEMINI_API_KEYS[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % GEMINI_API_KEYS.length;
    return key;
};

// Gemini proxy endpoint
router.post('/generate', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required.' });
        }
        
        if (GEMINI_API_KEYS.length === 0) {
            return res.status(500).json({ error: 'Gemini API key not configured.' });
        }
        
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        
        // Try all available API keys in round-robin fashion
        let lastError = null;
        for (let attempt = 0; attempt < GEMINI_API_KEYS.length; attempt++) {
            const apiKey = getNextApiKey();
            
            try {
                const response = await fetch(`${apiUrl}?key=${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }]
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    console.warn(`API key ${attempt + 1} failed:`, errorText);
                    lastError = errorText;
                    continue; // Try next key
                }
                
                const data = await response.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                return res.json({ text });
                
            } catch (err) {
                console.warn(`API key ${attempt + 1} error:`, err.message);
                lastError = err.message;
                continue; // Try next key
            }
        }
        
        // All keys failed
        return res.status(500).json({ 
            error: 'All API keys failed', 
            details: lastError 
        });
        
    } catch (err) {
        console.error('Gemini proxy error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
