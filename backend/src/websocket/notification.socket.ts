// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Real-Time Notification WebSocket Handler
// ============================================================

import { Server, Socket } from 'socket.io';
import { notificationService } from '../modules/notifications/notification.service.js';

export const NOTIFICATION_CLIENT_EVENTS = {
  MARK_READ: 'notification:mark_read',
  MARK_ALL_READ: 'notification:mark_all_read',
} as const;

export const NOTIFICATION_SERVER_EVENTS = {
  NEW: 'notification:new',
  SYSTEM_ALERT: 'notification:system_alert',
  MARKED_READ: 'notification:marked_read',
  ALL_MARKED_READ: 'notification:all_marked_read',
  ERROR: 'notification:error',
} as const;

export function registerNotificationSocketHandlers(io: Server, socket: Socket): void {
  socket.on(
    NOTIFICATION_CLIENT_EVENTS.MARK_READ,
    async (data: { notification_id: string; user_id: string }) => {
      try {
        if (!data?.notification_id || !data?.user_id) {
          socket.emit(NOTIFICATION_SERVER_EVENTS.ERROR, {
            message: 'notification_id and user_id are required',
          });
          return;
        }

        const updated = await notificationService.markAsRead(data.notification_id, data.user_id);

        if (updated) {
          socket.emit(NOTIFICATION_SERVER_EVENTS.MARKED_READ, updated);
        } else {
          socket.emit(NOTIFICATION_SERVER_EVENTS.ERROR, {
            message: 'Notification not found or does not belong to this user',
          });
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unexpected error';
        socket.emit(NOTIFICATION_SERVER_EVENTS.ERROR, { message });
      }
    }
  );

  socket.on(
    NOTIFICATION_CLIENT_EVENTS.MARK_ALL_READ,
    async (data: { user_id: string }) => {
      try {
        if (!data?.user_id) {
          socket.emit(NOTIFICATION_SERVER_EVENTS.ERROR, { message: 'user_id is required' });
          return;
        }

        const count = await notificationService.markAllReadForUser(data.user_id);
        socket.emit(NOTIFICATION_SERVER_EVENTS.ALL_MARKED_READ, { count });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unexpected error';
        socket.emit(NOTIFICATION_SERVER_EVENTS.ERROR, { message });
      }
    }
  );
}
