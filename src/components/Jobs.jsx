import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // <-- UNCOMMENTED
import { searchJobs, setSearchTerm, setSearchLocation, setSearchLevel } from '../redux/jobsSlice'; // <-- UNCOMMENTED
import { saveJob } from '../redux/userSlice'; // <-- UNCOMMENTED

const Jobs = () => {
    const dispatch = useDispatch(); // <-- UNCOMMENTED
    
    // --- REDUX SELECTORS (Using Redux state) ---
    const list = useSelector((state) => state.jobs.list);
    const searchTerm = useSelector((state) => state.jobs.searchTerm);
    const searchLocation = useSelector((state) => state.jobs.searchLocation);
    const searchLevel = useSelector((state) => state.jobs.searchLevel);
    const loading = useSelector((state) => state.jobs.loading);
    const error = useSelector((state) => state.jobs.error);

    // Mock User for preview (FIXED UUID FORMAT to prevent database error 500)
    // NOTE: In production, you would only use the Redux selector below.
    const mockUser = { 
        student_id: 'a1b2c3d4-e5f6-7890-1234-567890abcdef', // <-- FIX: Use valid UUID
        name: 'Demo Student', 
        skills: [{ name: 'React' }, { name: 'Node.js' }] 
    }; 
    
    // Use Redux user data if available, otherwise use mock data for initial load
    const user = useSelector((state) => state.user.data) || mockUser; 
    
    // 2. Helper: Gather Skills
    const getAggregatedSkills = () => {
        const skillsSet = new Set();
        if (user?.skills) {
            user.skills.forEach(s => skillsSet.add(s.name));
        }
        const uniqueSkills = Array.from(skillsSet);
        return uniqueSkills.length > 0 ? uniqueSkills.slice(0, 3).join(' ') : 'Software Engineer';
    };

    // 3. Initial Auto-Search (Uses Redux Thunk)
    useEffect(() => {
        // Only run auto-search if the list is empty AND not already searching
        if (list.length === 0 && !loading) {
            const smartQuery = getAggregatedSkills();
            const defaultLocation = 'India';
            const defaultLevel = 'entry level';

            // Set Redux state for inputs
            dispatch(setSearchTerm(smartQuery));
            dispatch(setSearchLocation(defaultLocation));
            dispatch(setSearchLevel(defaultLevel)); // Level is already default, but ensures consistency
            
            // Dispatch the search thunk
            dispatch(searchJobs({ query: smartQuery, location: defaultLocation, level: defaultLevel }));
        }
    }, [dispatch, list.length, loading, user.skills]); // Added user.skills as a dependency

    // 4. Search Handlers
    const handleSearch = () => {
        const query = searchTerm || 'Software Engineer';
        const location = searchLocation || 'India';
        // Dispatch search thunk using current Redux state values
        dispatch(searchJobs({ query, location, level: searchLevel }));
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleSearch();
    };

    // 5. Handle Apply / Save (Uses Redux Thunk)
    const handleApplyJob = (job) => {
        if (!user || !user.id && !user.student_id) {
            alert("Please log in to save or apply for jobs.");
            return;
        }

        const jobData = {
            // Using the fixed UUID from mock user or the real ID from Redux state
            student_id: user.id || user.student_id, 
            job_title: job.position,
            company_name: job.company,
            job_url: job.jobUrl,
            location: job.location,
            posted_date: job.date || new Date().toISOString()
        };

        // Dispatch the saveJob thunk and handle promises
        dispatch(saveJob(jobData))
            .unwrap()
            .then(() => {
                alert("Job Saved Successfully! Check your Applied Jobs dashboard.");
            })
            .catch((error) => {
                // Catches errors returned by rejectWithValue (e.g., 409 Conflict)
                console.error("Save failed:", error);
                alert(`Failed to save job: ${error}. It might already be saved.`);
            });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Available Jobs</h2>
            
            {/* --- ADVANCED SEARCH BAR --- */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    
                    {/* Role / Skill Input */}
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Role / Skills</label>
                        <input 
                            type="text" 
                            value={searchTerm} 
                            onChange={(e) => dispatch(setSearchTerm(e.target.value))} // <-- USING REDUX DISPATCH
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-blue-500 transition-colors"
                            placeholder="e.g. React Developer, Google..."
                        />
                    </div>

                    {/* Location Input */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Location</label>
                        <input 
                            type="text" 
                            value={searchLocation} 
                            onChange={(e) => dispatch(setSearchLocation(e.target.value))} // <-- USING REDUX DISPATCH
                            onKeyDown={handleKeyDown}
                            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-blue-500 transition-colors"
                            placeholder="e.g. Bangalore, Remote"
                        />
                    </div>

                    {/* Experience Level Select */}
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Experience</label>
                        <select 
                            value={searchLevel} 
                            onChange={(e) => dispatch(setSearchLevel(e.target.value))} // <-- USING REDUX DISPATCH
                            className="w-full px-4 py-2 rounded border border-gray-300 focus:outline-blue-500 bg-white transition-colors"
                        >
                            <option value="internship">Internship</option>
                            <option value="entry level">Entry Level</option>
                            <option value="associate">Associate</option>
                            <option value="mid senior">Mid-Senior</option>
                            <option value="director">Director</option>
                        </select>
                    </div>
                </div>
                
                <button 
                    onClick={handleSearch} 
                    disabled={loading}
                    className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors disabled:bg-blue-400"
                >
                    {loading ? 'Searching LinkedIn...' : 'Search Jobs'}
                </button>
            </div>

            {/* --- RESULTS AREA --- */}
            {loading ? (
                <div className="text-center py-16">
                    <div className="animate-spin h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-500 font-medium">Fetching latest opportunities for you...</p>
                </div>
            ) : error ? (
                <div className="p-6 bg-red-50 text-red-600 border border-red-200 rounded-lg text-center shadow-sm">
                    <p className="font-bold mb-1">Error fetching jobs</p>
                    <p className="text-sm">{error}. Please try again later.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {list.length > 0 ? list.map((job, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-300 transition-all group hover:shadow-md">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="flex-1">
                                    <strong className="text-xl text-gray-900 block group-hover:text-blue-600 transition-colors mb-1">
                                        {job.position}
                                    </strong>
                                    <div className="text-gray-700 font-semibold flex items-center gap-2">
                                        🏢 {job.company}
                                    </div>
                                    <div className="text-sm text-gray-500 mt-2 flex flex-wrap gap-4">
                                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                            📍 {job.location}
                                        </span>
                                        <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                                            📅 {job.date}
                                        </span>
                                        {job.salary && (
                                            <span className="flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded font-medium">
                                                💰 {job.salary}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 self-end md:self-center">
                                    {/* Save Button */}
                                    <button 
                                        onClick={() => handleApplyJob(job)} 
                                        className="text-gray-300 hover:text-blue-600 text-2xl transition-colors p-2 rounded-full hover:bg-blue-50"
                                        title="Save Job"
                                    >
                                        🔖
                                    </button>

                                    {/* Apply Button - Saves AND opens link */}
                                    <a 
                                        href={job.jobUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        onClick={() => handleApplyJob(job)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-bold transition-colors shadow-sm inline-flex items-center gap-2"
                                    >
                                        Apply Now 🚀
                                    </a>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-600 text-lg font-medium">No jobs found matching your criteria.</p>
                            <p className="text-gray-400 text-sm mt-1">Try adjusting your keyword, location, or experience level.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Jobs;