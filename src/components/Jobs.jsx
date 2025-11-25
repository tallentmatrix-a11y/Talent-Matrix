import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { searchJobs, setSearchTerm, setSearchLocation, setSearchLevel } from '../redux/jobsSlice';
import { addAppliedJob } from '../redux/userSlice';

const Jobs = () => {
  const dispatch = useDispatch();
  
  // 1. Get State from Redux
  const { list, searchTerm, searchLocation, searchLevel, loading, error } = useSelector((state) => state.jobs);
  const user = useSelector((state) => state.user.data);

  // 2. Helper: Gather Skills from all profile sources
  const getAggregatedSkills = () => {
      const skillsSet = new Set();
      
      // A. Manual Skills
      user.skills?.forEach(s => skillsSet.add(s.name));
      
      // B. If you had parsed resume skills in user object, add them here:
      // if (user.parsedSkills) Object.values(user.parsedSkills).flat().forEach(s => skillsSet.add(s));

      // Convert to array and take top 3 for a concise search query
      const uniqueSkills = Array.from(skillsSet);
      return uniqueSkills.length > 0 ? uniqueSkills.slice(0, 3).join(' ') : 'Software Engineer';
  };

  // 3. Initial Auto-Search
  useEffect(() => {
    // Only run if list is empty (first load)
    if (list.length === 0) {
        const smartQuery = getAggregatedSkills();
        const defaultLocation = 'India';
        const defaultLevel = 'entry level';

        // Sync state so inputs show what we searched for
        dispatch(setSearchTerm(smartQuery));
        dispatch(setSearchLocation(defaultLocation));
        
        // Perform Search
        dispatch(searchJobs({ 
            query: smartQuery, 
            location: defaultLocation,
            level: defaultLevel 
        }));
    }
  }, []); // Run once on mount

  // 4. Manual Search Handler
  const handleSearch = () => {
      dispatch(searchJobs({ 
          query: searchTerm || 'Software Engineer', 
          location: searchLocation || 'India',
          level: searchLevel 
      }));
  };

  const handleKeyDown = (e) => {
      if (e.key === 'Enter') handleSearch();
  };

  return (
    <div>
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
                    onChange={(e) => dispatch(setSearchTerm(e.target.value))}
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
                    onChange={(e) => dispatch(setSearchLocation(e.target.value))}
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
                    onChange={(e) => dispatch(setSearchLevel(e.target.value))}
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
                      <div className="flex justify-between items-start">
                          <div>
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
                          <button 
                            onClick={() => dispatch(addAppliedJob(job.jobUrl))} 
                            className="text-gray-300 hover:text-blue-600 text-2xl transition-colors p-2 rounded-full hover:bg-blue-50"
                            title="Save Job"
                          >
                            🔖
                          </button>
                      </div>
                      
                      <div className="mt-5 pt-4 border-t border-gray-100 flex gap-3">
                        <a 
                            href={job.jobUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-md text-sm font-bold transition-colors shadow-sm inline-block"
                        >
                            Apply Now 🚀
                        </a>
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