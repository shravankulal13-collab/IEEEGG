// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Authentication & Authorization Hook
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    fetchCurrentUser,
    isAuthenticated,
    hasRole,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      fetchCurrentUser();
    }
  }, [token, user, fetchCurrentUser]);

  return {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    isAuthenticated: isAuthenticated(),
    hasRole,
    clearError,
    isCitizen: user?.role === 'citizen',
    isDriver: user?.role === 'ambulance_driver',
    isDispatcher: user?.role === 'dispatcher',
    isHospitalAdmin: user?.role === 'hospital_admin',
    isAdmin: user?.role === 'system_admin',
  };
}
