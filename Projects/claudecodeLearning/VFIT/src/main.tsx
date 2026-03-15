import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { initFirebase } from '@/lib/firebase'
import './index.css'

// Initialize Firebase for push notifications (async, gracefully no-ops if not configured)
initFirebase().catch(() => {})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
