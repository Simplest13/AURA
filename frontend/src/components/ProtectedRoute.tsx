import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute ensures that only authenticated users can access the wrapped component.
 * It checks for a JWT token in localStorage. If none is found, the user is redirected to /login.
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
