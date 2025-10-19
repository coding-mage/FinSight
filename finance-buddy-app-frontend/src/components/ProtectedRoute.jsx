// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Not authenticated, redirect to home/login page
    return <Navigate to="/" replace />;
  }

  // Authenticated, render the protected component
  return children;
};

export default ProtectedRoute;