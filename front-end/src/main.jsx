import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

/* 
Качваш файловете
избираш височина, ширина, компресия и формат за всички
всяко има алт и preview (backend = име)
Дава ти да изтеглиш .zip файл, ако са повече от едно


*/

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
