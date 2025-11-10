import React from 'react'
import Login from '../Pages/Login'
import Signup from '../Pages/Signup'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'
const MainRouter = () => {
    return (
        <>
            <Router>
                <Routes>
                    <Route path='/' element={<Login />} />
                    <Route path='/login' element={<Login />} />
                    <Route path='/signup' element={<Signup />} />
                </Routes>
            </Router>
        </>
    )
}

export default MainRouter