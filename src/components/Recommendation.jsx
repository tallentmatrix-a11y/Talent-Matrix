import React, { useState } from 'react';
import { useSelector } from 'react-redux';

const Recommendation = () => {
  const user = useSelector((state) => state.user.data);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);

  const handleRunAnalysis = async () => {
    if (!user.resumeRemoteUrl) {
      setError("Please upload a resume in your Profile first.");
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // Use the actual username or a fallback
      const username = user.githubUsername || user.name?.replace(/\s+/g, '').toLowerCase() || "guest";
      
      console.log(`📡 Sending Analysis Request for: ${username}`);

      // CHANGED: Using POST request to send the URL securely
      const response = await fetch(`http://localhost:3000/api/ai/analyze-career`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: username,
          resumeUrl: user.resumeRemoteUrl // Sending the Database URL
        })
      });
      
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Analysis failed.");
      }

      setReport(data);
    } catch (err) {
      console.error("Analysis Error:", err);
      setError(err.message || "Server connection failed.");
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (percentageString) => {
    const val = parseInt(percentageString);
    if (val >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (val >= 50) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">AI Career Strategist</h2>
          <p className="text-gray-500 mt-1">
            Real-time market analysis comparing your resume against live job listings.
          </p>
        </div>

        {!loading && (
            <button 
              onClick={handleRunAnalysis}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all flex items-center gap-2"
            >
              {report ? "↻ Re-Run Analysis" : "🚀 Generate Skill Gap Report"}
            </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6 flex items-center gap-2">
          <span>⚠️</span> {error}
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-bold text-gray-800">Analyzing Profile...</h3>
          <p className="text-gray-500 mt-2 text-center max-w-md">
            Downloading resume, checking LeetCode, scraping live jobs... 
            <br/><span className="text-xs uppercase tracking-wide font-bold text-blue-500 mt-2 block">Please wait ~15 seconds</span>
          </p>
        </div>
      )}

      {!loading && report && (
        <div className="animate-fade-in-up">
          {/* Summary Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-6 rounded-xl mb-8">
            <h3 className="text-lg font-bold text-blue-900 mb-2">🔎 Candidate Analysis</h3>
            <p className="text-blue-800 leading-relaxed">
              {report.user_summary?.candidate_summary || "Profile analyzed successfully."}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-white text-blue-700 text-xs font-bold rounded-full border border-blue-200 shadow-sm">
                Jobs Scanned: {report.jobs_found_count || 0}
              </span>
              <span className="px-3 py-1 bg-white text-blue-700 text-xs font-bold rounded-full border border-blue-200 shadow-sm">
                 LeetCode: {report.user_summary?.leetcode_level || "Not Linked"}
              </span>
            </div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-4">Job Fit Analysis</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {report.analysis?.job_analyses?.map((job, idx) => (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-5 border-b border-gray-100 flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">{job.role}</h4>
                    <div className="text-gray-500 text-sm font-medium">{job.company}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-bold border ${getMatchColor(job.match_percentage)}`}>
                    {job.match_percentage} Match
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-2">
                      Missing Skills (Gap)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {job.missing_skills?.length > 0 ? (
                        job.missing_skills.map((skill, sIdx) => (
                          <span key={sIdx} className="bg-red-50 text-red-700 px-2 py-1 rounded text-xs font-medium border border-red-100">
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-green-600 text-sm flex items-center gap-1">
                          ✓ No major skill gaps!
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
                      Recommended Action
                    </label>
                    <p className="text-sm text-slate-700 italic">
                      "{job.action_plan}"
                    </p>
                  </div>
                  
                  {job.job_url && (
                    <a href={job.job_url} target="_blank" rel="noreferrer" className="block text-center w-full py-2 rounded-lg border border-gray-300 text-gray-700 font-medium text-sm hover:bg-gray-50 transition-colors">
                      View Job on LinkedIn ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendation;