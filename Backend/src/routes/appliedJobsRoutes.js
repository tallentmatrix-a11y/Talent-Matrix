const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');

// POST /api/applied-jobs - Save a new job
router.post('/', async (req, res) => {
  try {
    const { student_id, job_title, company_name, job_url, location, posted_date } = req.body;

    const { data, error } = await supabase
      .from('applied_jobs')
      .insert([
        { student_id, job_title, company_name, job_url, location, posted_date }
      ])
      .select();

    if (error) throw error;

    res.status(201).json({ message: "Job saved successfully", data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/applied-jobs/:studentId - Get all saved jobs for a student
router.get('/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const { data, error } = await supabase
      .from('applied_jobs')
      .select('*')
      .eq('student_id', studentId);

    if (error) throw error;

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;