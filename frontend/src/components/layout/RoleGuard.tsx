import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, DEMO_USERS } from '../../store/authStore';
import { type UserProfile } from '../../services/auth.service';
import { Spinner } from '../ui/Spinner';

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireAuth?: boolean;
}

export function getDefaultRolePath(role?: string): string {
  switch (role) {
    case 'citizen':
      return '/citizen';
    case 'ambulance_driver':
      return '/ambulance';
    case 'dispatcher':
      return '/dispatcher';
    case 'hospital_admin':
    case 'hospital_staff':
      return '/hospital';
    case 'system_admin':
      return '/admin';
    default:
      return '/login';
  }
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles = [],
  requireAuth = true,
}) => {
  const { user, token, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#061136] text-white">
        <Spinner size="lg" color="danger" />
        <p className="text-xs font-semibold text-slate-300 mt-4">Verifying access credentials...</p>
      </div>
    );
  }

  // If unauthenticated and route requires auth:
  // Check if we can auto-seed a tab-isolated demo user for this portal or redirect to login
  if (requireAuth && (!token || !user)) {
    if (allowedRoles.length > 0) {
      const primaryRole = allowedRoles[0] as keyof typeof DEMO_USERS;
      const demoAccount = DEMO_USERS[primaryRole];
      if (demoAccount) {
        const tabUser: UserProfile = {
          id: `demo-${primaryRole}`,
          email: demoAccount.email,
          fullName: demoAccount.fullName,
          role: demoAccount.role,
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        const demoToken = `demo-${primaryRole}-token`;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('token', demoToken);
          sessionStorage.setItem('resqgrid_user', JSON.stringify(tabUser));
        }
        useAuthStore.setState({ user: tabUser, token: demoToken });
        return <>{children}</>;
      }
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Multi-tab role isolation:
  // If this tab navigated to a portal with a different role, adapt this tab's session
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    const primaryRole = allowedRoles[0] as keyof typeof DEMO_USERS;
    const demoAccount = DEMO_USERS[primaryRole];
    if (demoAccount) {
      const tabUser: UserProfile = {
        id: `demo-${primaryRole}`,
        email: demoAccount.email,
        fullName: demoAccount.fullName,
        role: demoAccount.role,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      const demoToken = `demo-${primaryRole}-token`;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('token', demoToken);
        sessionStorage.setItem('resqgrid_user', JSON.stringify(tabUser));
      }
      useAuthStore.setState({ user: tabUser, token: demoToken });
      return <>{children}</>;
    }

    const destination = getDefaultRolePath(user.role);
    return <Navigate to={destination} replace />;
  }

  return <>{children}</>;
};
