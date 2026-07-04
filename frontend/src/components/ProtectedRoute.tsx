import { Navigate } from 'react-router-dom';
import { useSession } from '../lib/auth-client';
import React from 'react';

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false 
}: { 
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/login" replace />;
  }

  // Check if admin is required and user is not admin
  if (requireAdmin && (session.user as any).role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
