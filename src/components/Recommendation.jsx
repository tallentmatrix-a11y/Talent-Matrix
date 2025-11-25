import React from 'react';
import { useSelector } from 'react-redux';

const Recommendation = () => {
  const user = useSelector((state) => state.user.data);
  return (
    <div>
      <h2 className="text-3xl font-bold mb-8 text-gray-900">Recommendations</h2>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <p className="text-gray-800 mb-4">Based on your profile: consider internships in Web Development / Data Analysis fields.</p>
        {user.skills.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold mb-3 text-gray-900">Your Skills:</h3>
            <div className="flex flex-wrap gap-2">
              {user.skills.map((skill, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium">{skill.name}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendation;