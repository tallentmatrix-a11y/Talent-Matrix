import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../Pages/Dashboard';
import Login from '../Pages/Login';
import Signup from '../Pages/Signup';
import PlacementForm from '../Pages/PlacementForm';

// Dashboard Sub-Components
import Home from '../components/Home';
import Jobs from '../components/Jobs';
import AppliedJobs from '../components/AppliedJobs';
import Books from '../components/Books';
import Recommendation from '../components/Recommendation';
import Resume from '../components/Resume';
import Analytics from '../components/Analytics';
import UpdateProfile from '../components/UpdateProfile';

const MainRouter = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path='/' element={<Navigate to="/login" replace />} />
            <Route path='/login' element={<Login />} />
            <Route path='/signup' element={<Signup />} />
            <Route path='/placementform' element={<PlacementForm />} />

            {/* Dashboard Protected Layout */}
            <Route path='/dashboard' element={<Dashboard />}>
                {/* Default to Home */}
                <Route index element={<Home />} />
                
                {/* Sub-routes */}
                <Route path='home' element={<Home />} />
                <Route path='jobs' element={<Jobs />} />
                <Route path='applied' element={<AppliedJobs />} />
                <Route path='books' element={<Books />} />
                <Route path='recommendation' element={<Recommendation />} />
                <Route path='resume' element={<Resume />} />
                <Route path='analytics' element={<Analytics />} />
                <Route path='update-profile' element={<UpdateProfile />} />
            </Route>

            {/* 404 Fallback */}
            <Route path='*' element={<div className="p-10 text-center">404 - Page Not Found</div>} />
        </Routes>
    );
}

export default MainRouter;