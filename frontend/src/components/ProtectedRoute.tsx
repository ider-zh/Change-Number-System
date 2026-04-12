import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const token = localStorage.getItem('adminToken');

  if (!isAdmin || !token) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
