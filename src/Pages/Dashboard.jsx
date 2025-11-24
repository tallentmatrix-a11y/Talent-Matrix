import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from '../redux/store';
import { fetchUserData } from '../redux/userSlice';
import Sidebar from '../components/Sidebar';

// Inner component to handle side-effects like fetching user data
const DashboardContent = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
    } else {
      // Fetch user data once when dashboard loads
      dispatch(fetchUserData(userId));
    }
  }, [dispatch, navigate]);

  return (
    <div className="flex h-screen w-full bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>
    </div>
  );
};

const Dashboard = () => {
  return (
    <Provider store={store}>
      <DashboardContent />
    </Provider>
  );
};

export default Dashboard;