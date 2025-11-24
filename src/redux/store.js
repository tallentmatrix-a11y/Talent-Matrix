import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import resumeReducer from './resumeSlice';
import jobsReducer from './jobsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    resume: resumeReducer,
    jobs: jobsReducer,
  },
});

export default store;