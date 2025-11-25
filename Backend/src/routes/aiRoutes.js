const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// Endpoint: POST /api/ai/analyze-career
// Body: { username: "akshay", resumeUrl: "https://..." }
router.post('/analyze-career', aiController.runFullCareerAnalysis);

module.exports = router;