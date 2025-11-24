import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
// IMPORT THIS:
import { BrowserRouter } from 'react-router-dom' 

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter> {/* <--- THIS WRAPPER WAS MISSING */}
      <App />
    </BrowserRouter>
  </StrictMode>,
)