const { analyzeProfile } = require('../services/career_task');
const { fetchJobsForRoles } = require('../services/job_search_service');
const { scrapeJobSkills } = require('../services/job_scraper');
const { generateGapReport } = require('../services/skill_gap_analyzer');

exports.runFullCareerAnalysis = async (req, res) => {
    try {
        // We now expect data in the BODY (POST request), not params
        const { username, resumeUrl } = req.body;

        if (!resumeUrl) {
            return res.status(400).json({ success: false, error: "Resume URL is missing." });
        }

        // --- STEP 1: Analyze User (Download PDF from URL + LeetCode) ---
        const userProfile = await analyzeProfile(username, resumeUrl);
        
        // --- STEP 2: Find Jobs ---
        const suggestedRoles = userProfile.suggested_job_roles || ["Software Engineer"];
        // Search jobs in India (or make this dynamic if user has location data)
        const realJobs = await fetchJobsForRoles(suggestedRoles, 'India');

        if (realJobs.length === 0) {
            return res.json({ success: true, message: "No jobs found.", report: [] });
        }

        // --- STEP 3: Scrape Skills ---
        const jobsWithSkills = await scrapeJobSkills(realJobs);

        // --- STEP 4: Gap Analysis ---
        const finalReport = await generateGapReport(userProfile, jobsWithSkills);

        res.json({
            success: true,
            user_summary: userProfile,
            jobs_found_count: jobsWithSkills.length,
            analysis: finalReport
        });

    } catch (error) {
        console.error("❌ Full Analysis Failed:", error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};