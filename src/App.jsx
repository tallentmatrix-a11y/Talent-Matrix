import React from 'react'
import MainRouter from './routes/MainRouter'
const App = () => {
    return (
        <>
            <div className='flex flex-col min-h-screen justify-center items-center bg-[#21427C]'>
              <MainRouter></MainRouter>
            </div>
        </>
    )
}

export default App