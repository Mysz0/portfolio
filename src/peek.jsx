import React from 'react'
import { createRoot } from 'react-dom/client'
import PeekPage from './components/PeekPage'
import './index.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <PeekPage />
  </React.StrictMode>
)
