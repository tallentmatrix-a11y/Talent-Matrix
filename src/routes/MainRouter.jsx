import React from 'react'
import Login from '../Pages/Login'
import Signup from '../Pages/Signup'
import Dashboard from '../Pages/Dashboard'
import PlacementForm from '../Pages/PlacementForm'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'
const MainRouter = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/signup' element={<Signup />} />
                    <Route path='/dashboard' element={<Dashboard />} />
                    <Route path='/placementform' element={<PlacementForm />} />
                </Routes>
            </Router>
        </>
    )
}

export default MainRouter