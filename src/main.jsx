// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { startup } from './startup.js';

async function init() {
  const initialState = await startup();
console.log('...main', initialState.activeNode);
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App initialState={initialState} />
    </StrictMode>
  );
}

init();
