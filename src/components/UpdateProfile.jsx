import React, { useState, useRef, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserProfile, uploadResumeFile } from '../redux/userSlice';

const UpdateProfile = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);
  const resumeRef = useRef(null);

  // Local State for form fields
  const [formData, setFormData] = useState({
    githubUsername: '',
    linkedinUrl: '',
    mobileNumber: '',
    leetcodeUrl: '',
    hackerrankUrl: '',
    codechefUrl: '',
    codeforcesUrl: ''
  });

  const [status, setStatus] = useState({}); // For field-specific "Saved!" messages

  // Populate form when user data loads
  useEffect(() => {
    setFormData({
      githubUsername: user.githubUsername || '',
      linkedinUrl: user.linkedinUrl || '',
      mobileNumber: user.mobileNumber || '',
      leetcodeUrl: user.leetcodeUrl || '',
      hackerrankUrl: user.hackerrankUrl || '',
      codechefUrl: user.codechefUrl || '',
      codeforcesUrl: user.codeforcesUrl || ''
    });
  }, [user]);

  const handleSave = (field) => {
    setStatus(prev => ({ ...prev, [field]: 'saving' }));
    
    dispatch(updateUserProfile({ 
        userId: user.id, 
        data: { [field]: formData[field] } 
    }))
    .then(() => {
        setStatus(prev => ({ ...prev, [field]: 'saved' }));
        setTimeout(() => setStatus(prev => ({ ...prev, [field]: null })), 2000);
    })
    .catch(() => {
        setStatus(prev => ({ ...prev, [field]: 'error' }));
    });
  };

  const handleResumeUpdate = () => {
      const file = resumeRef.current?.files?.[0];
      if(!file) return alert("Select a PDF file first.");
      dispatch(uploadResumeFile({ userId: user.id, file }))
        .then(() => alert("Resume Updated Successfully!"))
        .catch(() => alert("Failed to update resume"));
  };

  // Helper to render Status Icon
  const StatusIcon = ({ field }) => {
      const s = status[field];
      if(s === 'saving') return <span className="text-amber-500 text-sm ml-2">🔄 Saving...</span>;
      if(s === 'saved') return <span className="text-emerald-500 text-sm ml-2">✅ Saved!</span>;
      if(s === 'error') return <span className="text-red-500 text-sm ml-2">❌ Error</span>;
      return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-900">🔗 Update Contact & Links</h2>
      <div className="flex flex-col gap-6">
        
        {/* Resume Update */}
        <div className="pb-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-3">📄 Update Resume</h3>
            <div className="flex gap-3 items-center">
                <input ref={resumeRef} type="file" accept=".pdf" className="block w-full text-sm text-gray-700 file:mr-4 file:py-2.5 file:px-4 file:rounded-md file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                <button onClick={handleResumeUpdate} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md font-semibold">
                    Update Resume
                </button>
            </div>
            {user.resumeRemoteUrl && <p className="text-xs mt-2 text-emerald-600">✓ Current resume uploaded to server</p>}
        </div>

        {/* GitHub */}
        <div className="flex flex-col">
          <label className="text-gray-600 font-semibold mb-2 flex items-center">GitHub Username <StatusIcon field="githubUsername"/></label>
          <div className="flex gap-3">
            <input type="text" value={formData.githubUsername} onChange={e=>setFormData({...formData, githubUsername: e.target.value})} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600" placeholder="e.g. yourusername" />
            <button onClick={() => handleSave('githubUsername')} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Save</button>
          </div>
        </div>

        {/* LinkedIn */}
        <div className="flex flex-col">
          <label className="text-gray-600 font-semibold mb-2 flex items-center">LinkedIn URL <StatusIcon field="linkedinUrl"/></label>
          <div className="flex gap-3">
            <input type="text" value={formData.linkedinUrl} onChange={e=>setFormData({...formData, linkedinUrl: e.target.value})} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600" placeholder="https://linkedin.com/..." />
            <button onClick={() => handleSave('linkedinUrl')} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Save</button>
          </div>
        </div>

        {/* Mobile */}
        <div className="flex flex-col">
          <label className="text-gray-600 font-semibold mb-2 flex items-center">Mobile Number <StatusIcon field="mobileNumber"/></label>
          <div className="flex gap-3">
            <input type="text" value={formData.mobileNumber} onChange={e=>setFormData({...formData, mobileNumber: e.target.value})} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600" placeholder="e.g. 9876543210" />
            <button onClick={() => handleSave('mobileNumber')} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Save</button>
          </div>
        </div>

        <hr className="my-2" />
        <h3 className="text-lg font-bold text-gray-800">Coding Profiles</h3>

        {/* LeetCode */}
        <div className="flex flex-col">
          <label className="text-gray-600 font-semibold mb-2 flex items-center">LeetCode URL <StatusIcon field="leetcodeUrl"/></label>
          <div className="flex gap-3">
            <input type="text" value={formData.leetcodeUrl} onChange={e=>setFormData({...formData, leetcodeUrl: e.target.value})} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600" placeholder="https://leetcode.com/..." />
            <button onClick={() => handleSave('leetcodeUrl')} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Save</button>
          </div>
        </div>

        {/* HackerRank */}
        <div className="flex flex-col">
          <label className="text-gray-600 font-semibold mb-2 flex items-center">HackerRank URL <StatusIcon field="hackerrankUrl"/></label>
          <div className="flex gap-3">
            <input type="text" value={formData.hackerrankUrl} onChange={e=>setFormData({...formData, hackerrankUrl: e.target.value})} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600" />
            <button onClick={() => handleSave('hackerrankUrl')} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Save</button>
          </div>
        </div>

        {/* CodeChef */}
        <div className="flex flex-col">
          <label className="text-gray-600 font-semibold mb-2 flex items-center">CodeChef URL <StatusIcon field="codechefUrl"/></label>
          <div className="flex gap-3">
            <input type="text" value={formData.codechefUrl} onChange={e=>setFormData({...formData, codechefUrl: e.target.value})} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600" />
            <button onClick={() => handleSave('codechefUrl')} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Save</button>
          </div>
        </div>

        {/* CodeForces */}
        <div className="flex flex-col">
          <label className="text-gray-600 font-semibold mb-2 flex items-center">CodeForces URL <StatusIcon field="codeforcesUrl"/></label>
          <div className="flex gap-3">
            <input type="text" value={formData.codeforcesUrl} onChange={e=>setFormData({...formData, codeforcesUrl: e.target.value})} className="flex-1 px-4 py-3 rounded-lg border border-gray-300 outline-blue-600" />
            <button onClick={() => handleSave('codeforcesUrl')} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold">Save</button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UpdateProfile;