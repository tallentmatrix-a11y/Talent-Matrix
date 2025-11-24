import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API_BASE = "http://localhost:3000";

// --- THUNK: This is the missing export ---
export const scanResume = createAsyncThunk('resume/scan', async (fileOrUrl) => {
  let formData = new FormData();

  if (typeof fileOrUrl === 'string') {
    // Case 1: It's a URL (stored resume), fetch it first
    const res = await fetch(fileOrUrl);
    if (!res.ok) throw new Error("Failed to download stored resume");
    const blob = await res.blob();
    const file = new File([blob], 'resume.pdf', { type: 'application/pdf' });
    formData.append('file', file);
  } else {
    // Case 2: It's a File object (fresh upload)
    formData.append('file', fileOrUrl);
  }

  const res = await fetch(`${API_BASE}/api/resume/extract`, {
    method: 'POST',
    body: formData,
  });
  
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Parse failed');
  
  if (!data.success || !data.skills) throw new Error(data.rawText || "No skills found");
  
  return data.skills;
});

// --- SLICE ---
const resumeSlice = createSlice({
  name: 'resume',
  initialState: {
    parsedSkills: null,
    loading: false,
    error: null,
    showJson: false
  },
  reducers: {
    toggleJsonView: (state) => { state.showJson = !state.showJson; },
    clearResumeState: (state) => { state.parsedSkills = null; state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(scanResume.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.parsedSkills = null;
      })
      .addCase(scanResume.fulfilled, (state, action) => {
        state.loading = false;
        state.parsedSkills = action.payload;
      })
      .addCase(scanResume.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  }
});

export const { toggleJsonView, clearResumeState } = resumeSlice.actions;
export default resumeSlice.reducer;