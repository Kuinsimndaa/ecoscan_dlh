import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const adminProfile = localStorage.getItem('admin_profile');

  // Jika tidak ada data profile di localStorage, redirect ke login
  if (!adminProfile) {
    return <Navigate to="/" replace />;
  }

  try {
    // Verifikasi bahwa data yang disimpan valid JSON
    JSON.parse(adminProfile);
    return children;
  } catch (e) {
    // Jika JSON tidak valid, clear localStorage dan redirect ke login
    localStorage.removeItem('admin_profile');
    return <Navigate to="/" replace />;
  }
};

export default ProtectedRoute;
