require('dotenv').config();
const pdfExtraction = require('pdf-extraction');
const OpenAI = require('openai');

const client = new OpenAI({
    apiKey: process.env.PERPLEXITY_API_KEY,
    baseURL: 'https://api.perplexity.ai'
});

const PORT = process.env.PORT || 3000;
// We assume LeetCode route is local
const LOCAL_API_URL = `http://localhost:${PORT}/api/leetcode`; 

// 1. Fetch LeetCode Stats
async function fetchLocalLeetCodeStats(username) {
    try {
        const response = await fetch(`${LOCAL_API_URL}/${username}`);
        if (!response.ok) return { note: "LeetCode data unavailable" };
        return await response.json();
    } catch (error) {
        return { note: "LeetCode data fetch failed" };
    }
}

// 2. Extract Text from URL (Database/Supabase)
async function extractResumeText(resumeUrl) {
    try {
        console.log(`📄 Downloading resume from: ${resumeUrl}...`);
        
        // Fetch the PDF file from the remote URL
        const response = await fetch(resumeUrl);
        
        if (!response.ok) {
            throw new Error(`Failed to download resume. Status: ${response.status}`);
        }

        // Convert the response to a Buffer for pdf-parsing
        const arrayBuffer = await response.arrayBuffer();
        const pdfBuffer = Buffer.from(arrayBuffer);
        
        // Extract text
        const data = await pdfExtraction(pdfBuffer);
        
        // Return cleaned text (limit length to save AI tokens)
        return data.text.slice(0, 15000);

    } catch (error) {
        console.error(`❌ Error parsing PDF URL: ${error.message}`);
        throw new Error("Could not read resume file from the provided URL.");
    }
}

// 3. Main Analysis Function
async function analyzeProfile(username, resumeUrl) {
    console.log(`\n🔹 STEP 1: Analyzing Profile for ${username}...`);

    // Run fetches in parallel
    const [leetcodeData, resumeText] = await Promise.all([
        fetchLocalLeetCodeStats(username),
        extractResumeText(resumeUrl)
    ]);

    const systemPrompt = `
    You are an expert Career Coach.
    Analyze the Resume and LeetCode stats.
    
    OUTPUT JSON STRUCTURE:
    {
        "candidate_summary": "String",
        "verified_skills": ["Skill A", "Skill B"],
        "leetcode_level": "String",
        "suggested_job_roles": ["Role 1", "Role 2"] 
    }
    `;

    const userMessage = `
    RESUME TEXT: ${resumeText}
    LEETCODE STATS: ${JSON.stringify(leetcodeData)}
    `;

    try {
        const response = await client.chat.completions.create({
            model: 'sonar-pro',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage }
            ]
        });

        const cleanJson = response.choices[0].message.content.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Analysis Error:", error);
        throw new Error("AI Analysis failed.");
    }
}

module.exports = { analyzeProfile };