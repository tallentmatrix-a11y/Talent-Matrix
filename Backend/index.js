require('dotenv').config();
const express = require('express');
const cors = require('cors');

const userRoutes = require('./src/routes/userRoutes');
const placementRoutes = require('./src/routes/placementRoutes');
const loginRoutes = require('./src/routes/loginRoutes'); // <--- 1. IMPORT THIS
const jobRoutes = require('./src/routes/jobRoutes'); // <--- Import this
const appliedJobsRoutes = require('./src/routes/appliedJobsRoutes');
const projectRoutes = require('./src/routes/projectRoutes');
const leetcodeRoutes = require('./src/routes/leetcodeRoutes'); // <--- Import
const resumeRoutes = require('./src/routes/resumeRoutes');
const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/signup', userRoutes);
app.use('/api/placement', placementRoutes);
app.use('/api/login', loginRoutes);
app.use('/api/jobs', jobRoutes); // <--- Add this line
app.use('/api/applied-jobs', appliedJobsRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leetcode', leetcodeRoutes); // <--- Mount it
app.use('/api/resume', resumeRoutes);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});