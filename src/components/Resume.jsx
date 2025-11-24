import React, { useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { scanResume, toggleJsonView } from '../redux/resumeSlice';
import { addSkill } from '../redux/userSlice';

const Resume = () => {
  const dispatch = useDispatch();
  const resumeUploadRef = useRef(null);
  const user = useSelector((state) => state.user.data);
  const { parsedSkills, loading, error, showJson } = useSelector((state) => state.resume);

  useEffect(() => {
    if (user.resumeRemoteUrl && !parsedSkills && !loading && !error) {
      dispatch(scanResume(user.resumeRemoteUrl));
    }
  }, [user.resumeRemoteUrl, parsedSkills, loading, error, dispatch]);

  const handleManualUpload = () => {
    const file = resumeUploadRef.current?.files?.[0];
    if (file) dispatch(scanResume(file));
  };

  const handleAddSkills = () => {
    if (!parsedSkills) return;
    Object.values(parsedSkills).flat().forEach(skillName => {
        dispatch(addSkill({ name: skillName, level: 'Intermediate', tags: 'Extracted' }));
    });
    alert(`Skills added!`);
  };

  // Flatten skills for table view
  const flattenedParsedSkills = parsedSkills ? Object.entries(parsedSkills).flatMap(([cat, arr]) => arr.map(skill => ({ category: cat, skill }))) : [];

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Resume Analyzer</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-xl mb-4 text-gray-900">Upload New Resume</h3>
          {user.resumeRemoteUrl ? (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-sm font-medium">✅ Stored Resume Found.</div>
          ) : (
            <div className="mb-4 p-3 bg-amber-50 text-amber-700 rounded-md border border-amber-200 text-sm font-medium">⚠️ No stored resume found.</div>
          )}
          <input ref={resumeUploadRef} type="file" accept=".pdf" className="mb-4 block w-full text-sm text-gray-800 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
          <div className="flex gap-3">
            <button onClick={handleManualUpload} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-5 py-2.5 rounded-md font-semibold text-sm">
              {loading ? 'Scanning...' : '⚡ Scan Uploaded Resume'}
            </button>
          </div>
          {error && <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 border border-red-200 rounded">{error}</div>}
        </div>

        {/* RIGHT */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="font-bold text-xl mb-3 text-gray-900">Extracted Skills</h3>
          {loading ? <div className="text-center py-10 text-gray-600">Analyzing...</div> : parsedSkills ? (
            <>
              <div className="mt-4 border border-gray-200 rounded-lg overflow-auto max-h-60">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr><th className="px-3 py-2">#</th><th className="px-3 py-2">Skill</th><th className="px-3 py-2">Category</th></tr>
                  </thead>
                  <tbody>
                    {flattenedParsedSkills.map((row, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-3 py-1.5 text-gray-600">{idx + 1}</td>
                        <td className="px-3 py-1.5 text-gray-900 font-medium">{row.skill}</td>
                        <td className="px-3 py-1.5 text-gray-700">{row.category}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => dispatch(toggleJsonView())} className="text-xs px-3 py-1.5 border rounded">{showJson ? 'Hide JSON' : 'Show JSON'}</button>
                <button onClick={handleAddSkills} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold ml-auto">Add Skills to Profile</button>
              </div>
              {showJson && <pre className="mt-3 bg-gray-900 text-white p-4 text-xs rounded overflow-auto max-h-64">{JSON.stringify(parsedSkills, null, 4)}</pre>}
            </>
          ) : <div className="h-full min-h-[150px] flex items-center justify-center text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-md">Upload a resume to analyze.</div>}
        </div>
      </div>
    </div>
  );
};

export default Resume;