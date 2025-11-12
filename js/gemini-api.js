// Gemini API Integration
const GEMINI_API_KEY = 'AIzaSyApbgd0-jvPN7rptLZXtMN4-CI7bNEONPE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const GeminiAPI = {
    async generateContent(prompt, retries = 3) {
        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }]
                    })
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Gemini API Error Response:', errorText);
                    
                    // If rate limited (429), wait and retry
                    if (response.status === 429 && attempt < retries - 1) {
                        const waitTime = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s
                        console.log(`⏰ Rate limited. Waiting ${waitTime/1000}s before retry ${attempt + 2}/${retries}...`);
                        await new Promise(resolve => setTimeout(resolve, waitTime));
                        continue; // Retry
                    }
                    
                    throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
                }

                const data = await response.json();
                console.log('Gemini API response data:', data);
                return data.candidates[0].content.parts[0].text;
            } catch (error) {
                // If it's the last attempt or not a network error, throw
                if (attempt === retries - 1 || !error.message.includes('429')) {
                    console.error('Gemini API Error:', error);
                    throw error;
                }
                // Otherwise, wait and retry
                const waitTime = Math.pow(2, attempt) * 2000;
                console.log(`⏰ Error occurred. Waiting ${waitTime/1000}s before retry ${attempt + 2}/${retries}...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    },

    // Moderate forum post content
    async moderatePost(postTitle, postContent) {
        const prompt = `You are a content moderator for a scholarship forum. Analyze this post and respond with ONLY a JSON object (no markdown, no extra text):

Post Title: "${postTitle}"
Post Content: "${postContent}"

Analyze for:
1. Inappropriate content (profanity, hate speech, spam, harassment)
2. Off-topic content (not related to scholarships/education)
3. Duplicate/low-quality questions

Respond with this exact JSON format:
{
  "isInappropriate": true/false,
  "reason": "brief explanation if inappropriate",
  "shouldDelete": true/false,
  "category": "inappropriate" or "off-topic" or "spam" or "safe"
}`;

        try {
            const response = await this.generateContent(prompt);
            // Extract JSON from response (remove markdown if present)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            // Fallback if no JSON found
            return {
                isInappropriate: false,
                reason: "",
                shouldDelete: false,
                category: "safe"
            };
        } catch (error) {
            console.error('Moderation error:', error);
            // On error, don't delete posts
            return {
                isInappropriate: false,
                reason: "Error during moderation",
                shouldDelete: false,
                category: "safe"
            };
        }
    },

    // Generate scholarship recommendations
    async recommendScholarships(studentProfile, scholarships) {
        const prompt = `You are an AI scholarship advisor. Analyze the student profile and available scholarships to provide personalized recommendations.

STUDENT PROFILE:
- Name: ${studentProfile.firstName} ${studentProfile.lastName}
- Email: ${studentProfile.email}
- GPA: ${studentProfile.gpa || 'Not provided'}
- Field of Study: ${studentProfile.fieldOfStudy || 'Not provided'}
- Year Level: ${studentProfile.yearLevel || 'Not provided'}
- Interests: ${studentProfile.interests || 'Not provided'}
- Achievements: ${studentProfile.achievements || 'Not provided'}
- Financial Need: ${studentProfile.financialNeed || 'Not specified'}

AVAILABLE SCHOLARSHIPS:
${scholarships.map((s, i) => `
${i + 1}. ${s.title}
   - Type: ${s.scholarshipType}
   - Region: ${s.region}
   - Institution: ${s.affiliatedInstitution}
   - Description: ${s.description.substring(0, 200)}...
   - Eligibility: ${s.eligibility}
   - Available Slots: ${s.availableSlots}
   - Deadline: ${new Date(s.deadline).toLocaleDateString()}
   - ID: ${s._id}
`).join('\n')}

Analyze these scholarships and recommend the top matches for this student. Return a JSON response with this structure:
{
  "recommendations": [
    {
      "scholarshipId": "actual_mongodb_id_here",
      "scholarshipTitle": "Scholarship Title",
      "matchScore": 85,
      "reasons": ["Specific reason 1", "Specific reason 2", "Specific reason 3"],
      "keyStrengths": ["Student's strength 1", "Student's strength 2"],
      "actionItems": ["Prepare document X", "Highlight achievement Y"]
    }
  ],
  "generalAdvice": "Personalized advice for improving scholarship applications"
}

Important: Return ONLY valid JSON. No markdown formatting, no code blocks, no extra text. Just pure JSON.`;

        try {
            console.log('Sending request to Gemini...');
            const response = await this.generateContent(prompt);
            console.log('Raw Gemini response:', response);
            
            // Try to extract JSON from response
            let jsonData;
            
            // Method 1: Try direct parse
            try {
                jsonData = JSON.parse(response);
                console.log('Parsed JSON directly');
            } catch (e) {
                console.log('Direct parse failed, trying to extract...');
                
                // Method 2: Extract JSON from markdown code blocks
                const codeBlockMatch = response.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
                if (codeBlockMatch) {
                    console.log('Found JSON in code block');
                    jsonData = JSON.parse(codeBlockMatch[1]);
                } else {
                    // Method 3: Find JSON object in text
                    const jsonMatch = response.match(/\{[\s\S]*\}/);
                    if (jsonMatch) {
                        console.log('Found JSON object in text');
                        jsonData = JSON.parse(jsonMatch[0]);
                    } else {
                        throw new Error('No valid JSON found in response');
                    }
                }
            }
            
            console.log('Parsed recommendations:', jsonData);
            
            // Validate structure
            if (!jsonData.recommendations || !Array.isArray(jsonData.recommendations)) {
                throw new Error('Invalid response structure');
            }
            
            return jsonData;
        } catch (error) {
            console.error('Recommendation error:', error);
            console.error('Error details:', error.message);
            return {
                recommendations: [],
                generalAdvice: `Error: ${error.message}. Please try again.`
            };
        }
    }
};

// Make it available globally
window.GeminiAPI = GeminiAPI;
