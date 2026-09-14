// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Realtime Notifications Client Service
// ============================================================

import { apiRequest } from './api';

export interface SystemNotification {
  id: string;
  type: 'EMERGENCY' | 'DISPATCH' | 'HOSPITAL' | 'TRAFFIC' | 'SYSTEM';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
}

export interface BroadcastPayload {
  title: string;
  message: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  target_roles: string[];
  expires_in_minutes?: number;
}

export class NotificationService {
  async getNotifications(): Promise<SystemNotification[]> {
    try {
      const res = await apiRequest<{ success: boolean; data: SystemNotification[] }>('/notifications');
      return res.data || [];
    } catch {
      return [];
    }
  }

  async markAsRead(id: string): Promise<void> {
    await apiRequest(`/notifications/${id}/read`, { method: 'POST' });
  }

  async markAllAsRead(): Promise<void> {
    await apiRequest('/notifications/read-all', { method: 'POST' });
  }

  async broadcastAlert(payload: BroadcastPayload): Promise<{ success: boolean; broadcast_id: string }> {
    const res = await apiRequest<{ success: boolean; broadcast_id: string }>('/notifications/broadcast', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return res;
  }
}

export const notificationService = new NotificationService();
