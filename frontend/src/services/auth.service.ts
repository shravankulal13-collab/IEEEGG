// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Auth API Client Service
// ============================================================

import { apiRequest } from './api';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'citizen' | 'ambulance_driver' | 'dispatcher' | 'hospital_admin' | 'hospital_staff' | 'system_admin';
  isActive: boolean;
  createdAt: string;
}

export interface AuthSuccessData {
  user: UserProfile;
  token: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  email: string;
  password?: string;
  full_name?: string;
  fullName?: string;
  phone?: string;
  role?: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<{ user: UserProfile; token: string }> {
    const res = await apiRequest<{ success: boolean; data: AuthSuccessData }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('resqgrid_user', JSON.stringify(res.data.user));
      }
    }
    return res.data;
  },

  async register(payload: RegisterPayload): Promise<{ user: UserProfile; token: string }> {
    const bodyPayload = {
      ...payload,
      fullName: payload.fullName || payload.full_name,
      full_name: payload.full_name || payload.fullName,
    };
    const res = await apiRequest<{ success: boolean; data: AuthSuccessData }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(bodyPayload),
    });
    if (res.data?.token) {
      localStorage.setItem('token', res.data.token);
      if (res.data.user) {
        localStorage.setItem('resqgrid_user', JSON.stringify(res.data.user));
      }
    }
    return res.data;
  },

  async getCurrentUser(): Promise<UserProfile> {
    const res = await apiRequest<{ success: boolean; data: UserProfile }>('/auth/me', {
      method: 'GET',
    });
    if (res.data) {
      localStorage.setItem('resqgrid_user', JSON.stringify(res.data));
    }
    return res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // Ignore network errors during logout
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('resqgrid_user');
    }
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    const res = await apiRequest<{ success: boolean; message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return { message: res.message };
  },

  async resetPassword(token: string, new_password: string): Promise<{ message: string }> {
    const res = await apiRequest<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password }),
    });
    return { message: res.message };
  },
};
