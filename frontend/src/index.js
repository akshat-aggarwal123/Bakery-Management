import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Optional: If you have global styles
import App from './App';
import { BrowserRouter } from 'react-router-dom'; // For routing
import ErrorBoundary from './ErrorBoundary'; // Correct path to ErrorBoundary
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

// Create the root element for React rendering
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the app with BrowserRouter, ErrorBoundary, and React.StrictMode
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* Ensures routing works */}
      <ErrorBoundary> {/* Catches errors in components */}
        <App />
      </ErrorBoundary>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();