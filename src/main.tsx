import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Dev shim: attach a browser-safe electronAPI when not running in Electron
import './electron-shim'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Use contextBridge if available (guarded)
if (window.ipcRenderer && typeof window.ipcRenderer.on === 'function') {
  window.ipcRenderer.on('main-process-message', (_event, message) => {
    console.log(message)
  })
} else {
  // noop in browser/dev
}