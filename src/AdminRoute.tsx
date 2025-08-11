import React from 'react';
import { Navigate } from 'react-router-dom';

export default function AdminRoute({ role, children }: { role: string | null; children: React.ReactElement }) {
  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}
