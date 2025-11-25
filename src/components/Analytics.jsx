import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const Analyse = () => {
  const user = useSelector((state) => state.user.data);
  const [companies, setCompanies] = useState([]); // State for list of companies
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingCompanies, setFetchingCompanies] = useState(true); // Loading state for list
  const [error, setError] = useState(null);

  // 1. Fetch Company List on Component Mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        // Make sure this matches your backend URL
        const response = await fetch('http://localhost:3000/api/ai/companies'); 
        const data = await response.json();
        
        if (data.success) {
            setCompanies(data.data);
        } else {
            setError("Failed to load company list.");
        }
      } catch (err) {
        setError("Error fetching company data.");
      } finally {
        setFetchingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  const handleCompanyClick = async (company) => {
    setSelectedCompany(company);
    setAnalysis(null);
    setLoading(true);
    setError(null);

    try {
        if (!user?.resumeRemoteUrl) throw new Error("Please upload a resume first.");

        const username = user.githubUsername || "user";
        
        const response = await fetch('http://localhost:3000/api/ai/analyze-target-company', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: username,
                resumeUrl: user.resumeRemoteUrl,
                companyName: company.company
            })
        });

        const data = await response.json();
        if (!data.success) throw new Error(data.error || "Analysis failed");
        
        setAnalysis(data.data);

    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const closePopup = () => {
    setSelectedCompany(null);
    setAnalysis(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Dream Company Analyzer</h2>
      
      {/* Loading State for List */}
      {fetchingCompanies && (
          <div className="text-center py-10 text-gray-500">Loading companies...</div>
      )}

      {/* Company Grid */}
      {!fetchingCompanies && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((comp, idx) => (
              <div 
                key={idx} 
                onClick={() => handleCompanyClick(comp)}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-1">{comp.company}</h3>
                <p className="text-sm text-gray-500 mb-3">{comp.role}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {comp.skills.slice(0, 3).map(s => (
                        <span key={s} className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{s}</span>
                    ))}
                    {comp.skills.length > 3 && <span className="text-xs text-gray-400">+{comp.skills.length - 3} more</span>}
                </div>
                <div className="text-green-600 font-semibold text-sm">💰 {comp.approx_CTC}</div>
              </div>
            ))}
          </div>
      )}

      {/* POPUP MODAL */}
      {selectedCompany && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative animate-fade-in-up">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <div>
                    <h3 className="text-2xl font-bold text-gray-900">{selectedCompany.company}</h3>
                    <p className="text-gray-500 text-sm">Role: {selectedCompany.role}</p>
                </div>
                <button onClick={closePopup} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>

            {/* Content */}
            <div className="p-6">
                {loading && (
                    <div className="text-center py-12">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Analyzing your profile against {selectedCompany.company}...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
                        {error}
                    </div>
                )}

                {!loading && analysis && (
                    <div className="space-y-6">
                        {/* Score */}
                        <div className="flex items-center gap-4 bg-blue-50 p-4 rounded-xl border border-blue-100">
                            <div className="text-4xl font-bold text-blue-600">{analysis.match_percentage}</div>
                            <div>
                                <div className="font-bold text-gray-900">Profile Match</div>
                                <div className="text-sm text-blue-800">Based on Resume & LeetCode</div>
                            </div>
                        </div>

                        {/* Missing Skills */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-2">⚠️ Missing Skills</h4>
                            <div className="flex flex-wrap gap-2">
                                {analysis.missing_skills && analysis.missing_skills.length > 0 ? analysis.missing_skills.map(s => (
                                    <span key={s} className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-sm font-medium border border-red-100">{s}</span>
                                )) : <span className="text-green-600">You matched all key skills! 🎉</span>}
                            </div>
                        </div>

                        {/* Advice */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-2">💡 AI Advice</h4>
                            <p className="text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm leading-relaxed">
                                {analysis.advice}
                            </p>
                        </div>

                        {/* Roadmap */}
                        <div>
                            <h4 className="font-bold text-gray-800 mb-3">🗺️ Preparation Roadmap</h4>
                            <div className="space-y-3">
                                {analysis.roadmap && analysis.roadmap.map((step, idx) => (
                                    <div key={idx} className="flex gap-3">
                                        <div className="flex-shrink-0 w-20 text-xs font-bold text-gray-500 uppercase mt-1">{step.step}</div>
                                        <div className="bg-white border border-gray-200 p-3 rounded-lg flex-1 shadow-sm text-sm text-gray-700">
                                            {step.action}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analyse;