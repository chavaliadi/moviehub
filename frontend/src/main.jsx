/* import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './css/index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/MovieHub">
      <App />
    </BrowserRouter>
  </StrictMode>
) */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './css/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter basename="/MovieHub">
    <App />
  </BrowserRouter>
);


