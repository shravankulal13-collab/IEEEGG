// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Realtime Notifications State Store
// ============================================================

import { create } from 'zustand';
import type { SystemNotification, BroadcastPayload } from '../services/notification.service';
import { notificationService } from '../services/notification.service';

interface NotificationState {
  notifications: SystemNotification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => void;
  broadcastAlert: (payload: BroadcastPayload) => Promise<void>;
  dismissNotification: (id: string) => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await notificationService.getNotifications();
      const unreadCount = data.filter((n) => !n.read).length;
      set({ notifications: data, unreadCount, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch notifications', isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    const notifications = get().notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
    try {
      await notificationService.markAsRead(id);
    } catch {
      // optimistic update maintained
    }
  },

  markAllAsRead: async () => {
    const notifications = get().notifications.map((n) => ({ ...n, read: true }));
    set({ notifications, unreadCount: 0 });
    try {
      await notificationService.markAllAsRead();
    } catch {
      // optimistic update maintained
    }
  },

  addNotification: (notification) => {
    const newNotif: SystemNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const notifications = [newNotif, ...get().notifications];
    set({ notifications, unreadCount: get().unreadCount + 1 });
  },

  broadcastAlert: async (payload: BroadcastPayload) => {
    try {
      await notificationService.broadcastAlert(payload);
      get().addNotification({
        type: 'EMERGENCY',
        severity: payload.severity,
        title: `BROADCAST: ${payload.title}`,
        message: payload.message,
      });
    } catch (err: any) {
      set({ error: err.message || 'Broadcast failed' });
      throw err;
    }
  },

  dismissNotification: (id: string) => {
    const notifications = get().notifications.filter((n) => n.id !== id);
    const unreadCount = notifications.filter((n) => !n.read).length;
    set({ notifications, unreadCount });
  },
}));
