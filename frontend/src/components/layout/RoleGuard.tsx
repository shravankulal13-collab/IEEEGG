// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: RoleGuard Route Protection
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Spinner } from '../ui/Spinner';

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { user, token, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-50">
        <Spinner size="lg" color="danger" />
        <p className="text-xs font-semibold text-slate-500 mt-4">Verifying access credentials...</p>
      </div>
    );
  }

  if (requireAuth && (!token || !user)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
