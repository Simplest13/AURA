import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css';
import './designTokens.css';

ReactDOM.createRoot(document.getElementById('app') as HTMLElement).render(
  React.createElement(React.StrictMode, null,
    React.createElement(App, null)
  )
);
