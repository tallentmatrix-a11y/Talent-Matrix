import React, { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateLocalPhoto } from '../redux/userSlice';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const profileUploadRef = useRef(null);

  // Redux State
  const user = useSelector((state) => state.user.data);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => dispatch(updateLocalPhoto(reader.result));
      reader.readAsDataURL(file);
    }
  };

  // Active state helper
  const isActive = (path) => {
    if (path === 'home') return location.pathname === '/dashboard' || location.pathname === '/dashboard/';
    return location.pathname.includes(path);
  };

  const navItems = [
    'home', 'jobs', 'applied', 'books', 'recommendation', 
    'resume', 'analytics', 'update-profile'
  ];

  return (
    <aside className="w-[255px] bg-gradient-to-b from-[#1e3a8a] to-[#1f40af] text-white p-6 flex flex-col items-center">
      <div className="text-center mb-6 w-full">
        <div className="w-[120px] h-[120px] rounded-full overflow-hidden border-4 border-white mx-auto mb-3 bg-white">
          <img
            src={user.photoDataUrl || 'https://via.placeholder.com/120'}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <input
          type="file"
          ref={profileUploadRef}
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />
        <button
          onClick={() => profileUploadRef.current?.click()}
          className="mt-2 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-md font-medium"
        >
          Change Photo
        </button>
        <div className="font-bold text-base mt-3">{user.name}</div>
        <div className="text-sm opacity-90 mt-1">{user.email}</div>
      </div>

      <input
        type="text"
        placeholder="Search..."
        className="w-full px-3 py-2 rounded-md bg-white/90 text-gray-800 placeholder-gray-500 outline-none mb-4"
      />

      <nav className="w-full flex flex-col gap-2 mb-auto">
        {navItems.map((section) => (
          <button
            key={section}
            onClick={() => navigate(section === 'home' ? '' : section)}
            className={`w-full text-left px-4 py-3 rounded-md font-medium transition-colors ${
              isActive(section) ? 'bg-blue-700' : 'bg-blue-800/50 hover:bg-blue-700'
            }`}
          >
            {section.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </button>
        ))}
      </nav>

      <div className="w-full flex flex-col gap-2 mt-4">
        <button
          onClick={handleLogout}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-md font-semibold"
        >
          Logout
        </button>
        <button
          onClick={() => document.body.classList.toggle('dark')}
          className="w-full bg-blue-900 hover:bg-blue-950 text-white px-4 py-2.5 rounded-md font-semibold"
        >
          Dark Mode
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;