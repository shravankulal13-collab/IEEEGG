// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Real-Time Notification WebSocket Handler
// ============================================================

import { Server, Socket } from 'socket.io';
import { notificationService } from '../modules/notifications/notification.service';

// ============================================================
// Socket Event Constants
// ============================================================

/** Events the CLIENT sends to the server (incoming). */
export const NOTIFICATION_CLIENT_EVENTS = {
  MARK_READ: 'notification:mark_read',
  MARK_ALL_READ: 'notification:mark_all_read',
} as const;

/** Events the SERVER sends to the client (outgoing). */
export const NOTIFICATION_SERVER_EVENTS = {
  NEW: 'notification:new',
  SYSTEM_ALERT: 'notification:system_alert',
  MARKED_READ: 'notification:marked_read',
  ALL_MARKED_READ: 'notification:all_marked_read',
  ERROR: 'notification:error',
} as const;

// ============================================================
// Connection-level handler
// Called once per connected socket from setupSocketServer.
// ============================================================

/**
 * Register notification-domain socket event listeners for a
 * single connected client.
 *
 * Outbound notification delivery (notification:new, notification:system_alert)
 * is handled by notificationService.create() and broadcastSystemAlert()
 * and does not require a per-socket listener — those push to rooms.
 *
 * This handler manages client-initiated actions:
 *   - mark a single notification as read
 *   - mark all notifications as read
 */
export function registerNotificationSocketHandlers(io: Server, socket: Socket): void {
  /**
   * Mark a single notification as read.
   *
   * Client sends:  { notification_id: string, user_id: string }
   * Server emits:  notification:marked_read  (updated record)
   *             or notification:error        (validation / not found)
   */
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

  /**
   * Mark all unread notifications for a user as read.
   *
   * Client sends:  { user_id: string }
   * Server emits:  notification:all_marked_read  ({ count: number })
   *             or notification:error
   */
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
