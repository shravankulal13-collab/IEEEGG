// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Auth Session State Store & Role Matrix
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import { create } from 'zustand';
import { authService, type UserProfile, type LoginPayload, type RegisterPayload } from '../services/auth.service';

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  setUser: (user: UserProfile | null) => void;
  switchDemoRole: (role: 'citizen' | 'ambulance_driver' | 'dispatcher' | 'hospital_admin' | 'system_admin') => string;
  clearError: () => void;

  // Computed / Convenience Helpers
  isAuthenticated: () => boolean;
  hasRole: (role: string | string[]) => boolean;
}

const DEMO_USERS: Record<string, { email: string; fullName: string; role: UserProfile['role']; targetPath: string }> = {
  citizen: {
    email: 'citizen@resqgrid.org',
    fullName: 'Rahul Sharma (Citizen)',
    role: 'citizen',
    targetPath: '/citizen',
  },
  ambulance_driver: {
    email: 'driver@resqgrid.org',
    fullName: 'Paramedic Officer Raj (Unit 742)',
    role: 'ambulance_driver',
    targetPath: '/ambulance',
  },
  dispatcher: {
    email: 'dispatcher@resqgrid.org',
    fullName: 'Chief Dispatcher Sarah Jenkins',
    role: 'dispatcher',
    targetPath: '/dispatcher',
  },
  hospital_admin: {
    email: 'hospital@resqgrid.org',
    fullName: 'Dr. Ramesh Rao (Trauma Chief)',
    role: 'hospital_admin',
    targetPath: '/hospital',
  },
  system_admin: {
    email: 'admin@resqgrid.org',
    fullName: 'Platform Operations Admin',
    role: 'system_admin',
    targetPath: '/admin',
  },
};

const getInitialUser = (): UserProfile | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  const raw = localStorage.getItem('resqgrid_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const getInitialToken = (): string | null => {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return localStorage.getItem('token');
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: getInitialUser(),
  token: getInitialToken(),
  isLoading: false,
  error: null,

  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(payload);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Login failed. Please verify your credentials.' });
      throw err;
    }
  },

  switchDemoRole: (role) => {
    const matched = DEMO_USERS[role] || DEMO_USERS.citizen;
    const demoUser: UserProfile = {
      id: `demo-${role}`,
      email: matched.email,
      fullName: matched.fullName,
      role: matched.role,
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    const demoToken = `demo-${role}-jwt-token`;
    localStorage.setItem('token', demoToken);
    localStorage.setItem('resqgrid_user', JSON.stringify(demoUser));
    set({ user: demoUser, token: demoToken, error: null });
    return matched.targetPath;
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(payload);
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (err: any) {
      set({ isLoading: false, error: err.message || 'Registration failed.' });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout().catch(() => {});
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('resqgrid_user');
      set({ user: null, token: null, isLoading: false, error: null });
    }
  },

  fetchCurrentUser: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }
    try {
      const user = await authService.getCurrentUser();
      set({ user, isLoading: false });
    } catch {
      // If token expired or invalid, keep current local cache unless explicit 401
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('resqgrid_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('resqgrid_user');
    }
    set({ user });
  },
  clearError: () => set({ error: null }),

  isAuthenticated: () => !!get().token && !!get().user,

  hasRole: (role) => {
    const userRole = get().user?.role;
    if (!userRole) return false;
    if (Array.isArray(role)) {
      return role.includes(userRole);
    }
    return userRole === role;
  },
}));
