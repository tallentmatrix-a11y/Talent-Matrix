const express = require('express');
const router = express.Router();
const linkedin = require('linkedin-jobs-api');

// GET /api/jobs?query=Developer&location=Remote
router.get('/', async (req, res) => {
  try {
    // Get query parameters from frontend, default to 'Software Engineer' if empty
    const query = req.query.query || 'Software Engineer';
    const location = req.query.location || 'India'; // Default location

    const queryOptions = {
      keyword: query,
      location: location,
      dateSincePosted: 'past Week', // Options: past Month, past Week, 24hr
      jobType: 'full time', // Options: full time, part time, contract, temporary, volunteer, internship
      remoteFilter: 'remote', // Options: on-site, remote, hybrid
      salary: '100000+', // Example salary filter
      experienceLevel: 'entry level', // Options: internship, entry level, associate, senior, director, executive
      limit: '10', // Number of jobs to fetch
      page: '0' // Pagination
    };

    const jobs = await linkedin.query(queryOptions);

    res.status(200).json(jobs);
  } catch (err) {
    console.error("Job Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch jobs from LinkedIn" });
  }
});

module.exports = router;