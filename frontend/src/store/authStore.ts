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

export const DEMO_USERS: Record<string, { email: string; fullName: string; role: UserProfile['role']; targetPath: string }> = {
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
    fullName: 'Dr. Ramesh Rao (Medical Chief)',
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
  if (typeof window === 'undefined') return null;
  // Check tab-isolated sessionStorage first
  const sessionRaw = window.sessionStorage?.getItem('resqgrid_user');
  if (sessionRaw) {
    try {
      return JSON.parse(sessionRaw);
    } catch {
      // ignore
    }
  }
  // Check global localStorage fallback
  const localRaw = window.localStorage?.getItem('resqgrid_user');
  if (!localRaw) return null;
  try {
    return JSON.parse(localRaw);
  } catch {
    return null;
  }
};

const getInitialToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage?.getItem('token') || window.localStorage?.getItem('token') || null;
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
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('resqgrid_user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('resqgrid_user', JSON.stringify(data.user));
      }
      set({ user: data.user, token: data.token, isLoading: false, error: null });
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
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('token', demoToken);
      sessionStorage.setItem('resqgrid_user', JSON.stringify(demoUser));
      localStorage.setItem('token', demoToken);
      localStorage.setItem('resqgrid_user', JSON.stringify(demoUser));
    }
    set({ user: demoUser, token: demoToken, error: null });
    return matched.targetPath;
  },

  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(payload);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('resqgrid_user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        localStorage.setItem('resqgrid_user', JSON.stringify(data.user));
      }
      set({ user: data.user, token: data.token, isLoading: false });
    } catch (err: any) {
      const isNetworkError = String(err.message || '').includes('Unable to connect') || 
                             String(err.message || '').includes('Failed to fetch') ||
                             String(err.message || '').includes('NetworkError');

      if (isNetworkError) {
        const fallbackUser: UserProfile = {
          id: `local-${Date.now()}`,
          email: payload.email,
          fullName: payload.fullName || payload.full_name || 'New User',
          phone: payload.phone || undefined,
          role: (payload.role as UserProfile['role']) || 'citizen',
          isActive: true,
          createdAt: new Date().toISOString(),
        };
        const fallbackToken = `resqgrid-local-token-${Date.now()}`;
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('token', fallbackToken);
          sessionStorage.setItem('resqgrid_user', JSON.stringify(fallbackUser));
          localStorage.setItem('token', fallbackToken);
          localStorage.setItem('resqgrid_user', JSON.stringify(fallbackUser));
        }
        set({ user: fallbackUser, token: fallbackToken, isLoading: false, error: null });
        return;
      }

      set({ isLoading: false, error: err.message || 'Registration failed.' });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout().catch(() => {});
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('resqgrid_user');
        localStorage.removeItem('token');
        localStorage.removeItem('resqgrid_user');
      }
      set({ user: null, token: null, isLoading: false, error: null });
    }
  },

  fetchCurrentUser: async () => {
    const token = typeof window !== 'undefined'
      ? (sessionStorage.getItem('token') || localStorage.getItem('token'))
      : null;
    if (!token) {
      set({ user: null, token: null });
      return;
    }
    try {
      const user = await authService.getCurrentUser();
      set({ user, isLoading: false });
    } catch {
      // Keep current local cache
    }
  },

  setUser: (user) => {
    if (typeof window !== 'undefined') {
      if (user) {
        sessionStorage.setItem('resqgrid_user', JSON.stringify(user));
        localStorage.setItem('resqgrid_user', JSON.stringify(user));
      } else {
        sessionStorage.removeItem('resqgrid_user');
        localStorage.removeItem('resqgrid_user');
      }
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
