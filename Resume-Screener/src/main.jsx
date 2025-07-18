import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ResumeScreener from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ResumeScreener />
  </StrictMode>,
)
