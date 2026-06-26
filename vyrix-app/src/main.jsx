import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'

// Heartbeat + drain offline sync queue on every app launch.
// The real app version is filled in by the main process (app.getVersion()).
if (window.vyrix) {
  window.vyrix.heartbeat().catch(() => {})
  window.vyrix.sync.drain().catch(() => {})
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
)
