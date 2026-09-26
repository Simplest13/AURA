// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

import Login from './pages/Login';
import Register from './pages/Register';
import Health from './pages/Health';
import Reminders from './pages/Reminders';
import Lectures from './pages/Lectures';
import Pdf from './pages/Pdf';
import ProtectedRoute from './components/ProtectedRoute';

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        {/* ── Navigation bar ───────────────────────────────────── */}
        <header style={{ padding: '1rem', background: '#f0f0f0' }}>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
            {/* optional – once you’re logged in you can reach the others */}
            <Link to="/">Home</Link>
            <Link to="/reminders">Reminders</Link>
            <Link to="/lectures">Lectures</Link>
            <Link to="/pdf">PDF</Link>
          </nav>
        </header>

        {/* ── Routes ─────────────────────────────────────────────── */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Health />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminders"
            element={
              <ProtectedRoute>
                <Reminders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lectures"
            element={
              <ProtectedRoute>
                <Lectures />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pdf"
            element={
              <ProtectedRoute>
                <Pdf />
              </ProtectedRoute>
            }
          />
          {/* catch‑all → home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
};

export default App;