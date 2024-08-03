import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/* 
Качваш файловете
избираш височина, ширина, компресия и формат за всички
всяко има алт и preview (backend = име)
Дава ти да изтеглиш .zip файл, ако са повече от едно


*/

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
