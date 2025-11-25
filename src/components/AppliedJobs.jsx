import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AppliedJobs = () => {
  // Access user data from Redux
  const user = useSelector((state) => state.user.data);
  // Fallback to check for different ID field names (id vs student_id)
  const studentId = user?.student_id || user?.id;

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      // If no user ID is found, don't attempt fetch
      if (!studentId) {
        setLoading(false);
        return;
      }

      try {
        // MATCHING YOUR BACKEND ROUTE: /api/applied-jobs/:studentId
        // Ensure your backend URL (e.g., localhost:3000) is correct
        const response = await axios.get(`http://localhost:3000/api/applied-jobs/${studentId}`);
        setJobs(response.data);
      } catch (err) {
        console.error("Error fetching applied jobs:", err);
        setError("Failed to load your saved jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [studentId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Your Job Dashboard</h2>
        <span className="bg-blue-100 text-blue-800 text-sm font-semibold px-3 py-1 rounded-full">
          {jobs.length} Saved
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div 
              key={job.id || job.job_url} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
            >
              <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                
                {/* Job Details Section */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {job.job_title || "Untitled Position"}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-3">
                    <span className="font-semibold text-gray-800 flex items-center gap-1">
                      🏢 {job.company_name || "Unknown Company"}
                    </span>
                    {job.location && (
                      <span className="flex items-center gap-1">
                        📍 {job.location}
                      </span>
                    )}
                    {job.posted_date && (
                      <span className="flex items-center gap-1">
                        🕒 Posted: {new Date(job.posted_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Button Section */}
                <div className="flex items-center gap-3">
                  <a 
                    href={job.job_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    Apply Now
                    <svg className="ml-2 -mr-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
              
              {/* Optional: Footer or Status Bar */}
              <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                <span>Added on {new Date(job.created_at || Date.now()).toLocaleDateString()}</span>
                <span className="uppercase tracking-wider font-semibold text-green-600">Active</span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs saved</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by browsing the jobs section.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppliedJobs;