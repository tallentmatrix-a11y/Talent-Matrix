import React from 'react';
import { useSelector } from 'react-redux';

const AppliedJobs = () => {
  const applied = useSelector((state) => state.user.data.appliedJobs);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Applied/Saved Jobs</h2>
      <div className="space-y-4">
        {applied.length > 0 ? applied.map((jobUrl, idx) => (
          <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex justify-between items-center">
            <div className="overflow-hidden text-ellipsis whitespace-nowrap mr-4 text-blue-600 font-medium">
              <a href={jobUrl} target="_blank" rel="noopener noreferrer">{jobUrl}</a>
            </div>
            <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Saved</span>
          </div>
        )) : <p className="text-gray-600">No jobs saved yet.</p>}
      </div>
    </div>
  );
};

export default AppliedJobs;