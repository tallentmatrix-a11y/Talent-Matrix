import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = "http://localhost:3000";

// --- THUNK: Search Jobs ---
// Accepts an object: { query, location, level }
// Or a string (legacy support)
export const searchJobs = createAsyncThunk('jobs/search', async (params) => {
  let queryString = 'Software Engineer';
  let locationString = 'India';
  let levelString = 'entry level';

  // Determine input type
  if (typeof params === 'object') {
      queryString = params.query || queryString;
      locationString = params.location || locationString;
      levelString = params.level || levelString;
  } else if (typeof params === 'string') {
      queryString = params;
  }

  // Construct URL
  const url = `${API_BASE}/api/jobs?query=${encodeURIComponent(queryString)}&location=${encodeURIComponent(locationString)}&level=${encodeURIComponent(levelString)}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch jobs');
  return await res.json();
});

const jobsSlice = createSlice({
  name: 'jobs',
  initialState: {
    list: [],
    searchTerm: '',     // Role/Skill input
    searchLocation: '', // Location input
    searchLevel: 'entry level', // Dropdown selection
    loading: false,
    error: null
  },
  reducers: {
    setSearchTerm: (state, action) => { state.searchTerm = action.payload; },
    setSearchLocation: (state, action) => { state.searchLocation = action.payload; },
    setSearchLevel: (state, action) => { state.searchLevel = action.payload; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchJobs.pending, (state) => { 
          state.loading = true; 
          state.error = null; 
      })
      .addCase(searchJobs.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(searchJobs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { setSearchTerm, setSearchLocation, setSearchLevel } = jobsSlice.actions;
export default jobsSlice.reducer;