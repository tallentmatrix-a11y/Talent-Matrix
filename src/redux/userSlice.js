import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = "http://localhost:3000"; // Ensure this matches your backend port

// --- THUNKS ---

// 1. Fetch Basic User Data
export const fetchUserData = createAsyncThunk('user/fetchData', async (userId) => {
  const res = await fetch(`${API_BASE}/api/signup/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch user');
  const data = await res.json();
  
  const semesters = {};
  for(let i=1; i<=8; i++) {
    if(data[`gpa_sem_${i}`]) semesters[`Semester ${i}`] = data[`gpa_sem_${i}`];
  }

  // Fetch Manual Projects
  let manualProjects = [];
  try {
    const projRes = await fetch(`${API_BASE}/api/projects/${userId}`);
    if (projRes.ok) {
      const projData = await projRes.json();
      manualProjects = projData.map(p => ({ ...p, source: 'manual' }));
    }
  } catch (e) { console.error(e); }

  return {
    id: data.id,
    name: data.full_name,
    email: data.email,
    rollNumber: data.roll_number || '',
    photoDataUrl: data.profile_image_url || '',
    resumeRemoteUrl: data.resume_url || '',
    semesters,
    mobileNumber: data.mobile_number || '',
    githubUsername: data.github_username || '',
    linkedinUrl: data.linkedin_url || '',
    leetcodeUrl: data.leetcode_url || '',
    hackerrankUrl: data.hackerrank_url || '',
    codechefUrl: data.codechef_url || '',
    codeforcesUrl: data.codeforces_url || '',
    skills: [], 
    appliedJobs: [],
    manualProjects,
    leetcodeStats: null, // Initialize
    codingStats: {}
  };
});

// 2. Fetch GitHub Repos
export const fetchGithubRepos = createAsyncThunk('user/fetchGithub', async (username) => {
  if (!username) return [];
  const res = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
  if (!res.ok) throw new Error("GitHub User not found");
  const repos = await res.json();
  return repos
    .filter((repo) => typeof repo.description === 'string' && repo.description.trim().length > 0)
    .map((repo) => ({
      source: 'github',
      id: repo.id,
      title: repo.name,
      link: repo.html_url,
      description: repo.description.trim(),
      tags: repo.language || "Code",
    }));
});

// 3. NEW: Fetch LeetCode Stats
export const fetchLeetCodeStats = createAsyncThunk('user/fetchLeetCode', async (username) => {
  if (!username) return null;
  // NOTE: Ensure your express app is mounting the route at /api/leetcode
  const res = await fetch(`${API_BASE}/api/leetcode/${username}`);
  if (!res.ok) throw new Error("LeetCode User not found");
  const data = await res.json();
  return data; // Returns { total, easy, medium, hard, topics }
});

// 4. Update Profile
export const updateUserProfile = createAsyncThunk('user/update', async ({ userId, data }) => {
  const payload = {};
  for (const key in data) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    payload[snakeKey] = data[key];
  }

  const res = await fetch(`${API_BASE}/api/signup/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  
  if (!res.ok) throw new Error('Update failed');
  return data;
});

// 5. Upload Resume
export const uploadResumeFile = createAsyncThunk('user/uploadResume', async ({ userId, file }) => {
    const formData = new FormData();
    formData.append('resume', file);
    const res = await fetch(`${API_BASE}/api/signup/${userId}/resume`, { method: 'PUT', body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    return data.resumeUrl || data.resume_url;
});

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: {
      id: '', name: '', photoDataUrl: '', resumeRemoteUrl: '', 
      skills: [], appliedJobs: [], manualProjects: [], githubProjects: [], semesters: {},
      leetcodeStats: null,
      githubUsername: '', linkedinUrl: '', mobileNumber: '',
      leetcodeUrl: '', hackerrankUrl: '', codechefUrl: '', codeforcesUrl: ''
    },
    status: 'idle',
    githubStatus: 'idle',
    leetcodeStatus: 'idle', // Track LeetCode status
    error: null
  },
  reducers: {
    logout: (state) => {
      localStorage.removeItem('userId');
      state.data = {};
      state.status = 'idle';
    },
    addSkill: (state, action) => {
      const exists = state.data.skills.some(s => s.name.toLowerCase() === action.payload.name.toLowerCase());
      if (!exists) state.data.skills.push(action.payload);
    },
    deleteSkill: (state, action) => {
      state.data.skills = state.data.skills.filter((_, i) => i !== action.payload);
    },
    updateLocalPhoto: (state, action) => {
      state.data.photoDataUrl = action.payload;
    },
    addAppliedJob: (state, action) => {
      if (!state.data.appliedJobs.includes(action.payload)) {
        state.data.appliedJobs.push(action.payload);
      }
    },
    addManualProject: (state, action) => {
      state.data.manualProjects.unshift({ ...action.payload, source: 'manual' });
    },
    removeManualProject: (state, action) => {
      state.data.manualProjects = state.data.manualProjects.filter(p => p.id !== action.payload);
    },
    updateSemester: (state, action) => {
       const { name, grade } = action.payload;
       state.data.semesters[name] = parseFloat(grade);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = { ...state.data, ...action.payload };
      })
      // GitHub
      .addCase(fetchGithubRepos.pending, (state) => { state.githubStatus = 'loading'; })
      .addCase(fetchGithubRepos.fulfilled, (state, action) => {
        state.githubStatus = 'succeeded';
        state.data.githubProjects = action.payload;
      })
      .addCase(fetchGithubRepos.rejected, (state) => { state.githubStatus = 'failed'; })
      
      // LeetCode
      .addCase(fetchLeetCodeStats.pending, (state) => { state.leetcodeStatus = 'loading'; })
      .addCase(fetchLeetCodeStats.fulfilled, (state, action) => {
        state.leetcodeStatus = 'succeeded';
        state.data.leetcodeStats = action.payload;
      })
      .addCase(fetchLeetCodeStats.rejected, (state) => { state.leetcodeStatus = 'failed'; })

      // Update Profile
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.data = { ...state.data, ...action.payload };
      })
      // Upload Resume
      .addCase(uploadResumeFile.fulfilled, (state, action) => {
          state.data.resumeRemoteUrl = action.payload;
      });
  }
});

export const { logout, addSkill, deleteSkill, updateLocalPhoto, addAppliedJob, addManualProject, removeManualProject, updateSemester } = userSlice.actions;
export default userSlice.reducer;