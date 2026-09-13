// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Notifications & Alert Feed Store
// ============================================================

import { create } from 'zustand';
import type { NotificationRecord } from '../services/notification.service';
import { socketClient } from '../services/socket';

interface NotificationState {
  notifications: NotificationRecord[];
  unreadCount: number;
  addNotification: (notification: NotificationRecord) => void;
  markAsRead: (id: string, userId?: string) => void;
  markAllAsRead: (userId?: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,

  addNotification: (notification) =>
    set((state) => {
      // Avoid duplicate IDs
      if (state.notifications.some((n) => n.id === notification.id)) {
        return state;
      }
      const updated = [notification, ...state.notifications];
      const unread = updated.filter((n) => !n.is_read).length;
      return { notifications: updated, unreadCount: unread };
    }),

  markAsRead: (id, userId = 'current-dispatcher') => {
    socketClient.markNotificationRead(id, userId);
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.is_read).length,
      };
    });
  },

  markAllAsRead: (userId = 'current-dispatcher') => {
    socketClient.markAllNotificationsRead(userId);
    set((state) => ({
      notifications: state.notifications.map((n) => ({
        ...n,
        is_read: true,
        read_at: new Date().toISOString(),
      })),
      unreadCount: 0,
    }));
  },

  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
