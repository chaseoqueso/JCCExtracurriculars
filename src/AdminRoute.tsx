import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ role, children }: { role: string | null; children: React.ReactElement }) {
  if (role === null) {
    // Still loading user role
    return (
      <div className="h-screen flex items-center justify-center text-gray-600">
        Checking permissions...
      </div>
    );
  }
  
  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}
