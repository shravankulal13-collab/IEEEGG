// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Emergency Alert & Notification Service
// ============================================================

import { query } from '../../config/database';
import { Server } from 'socket.io';

// ============================================================
// Types
// ============================================================

/**
 * Mirrors the notification_type enum defined in database/schema.sql.
 * Do NOT add values here without a corresponding schema migration.
 */
export type NotificationType =
  | 'incident_created'
  | 'incident_verified'
  | 'ambulance_dispatched'
  | 'ambulance_assigned'
  | 'ambulance_arriving'
  | 'route_changed'
  | 'traffic_alert'
  | 'hospital_selected'
  | 'hospital_capacity'
  | 'dispatch_reassigned'
  | 'incident_cancelled'
  | 'system_alert';

/** Mirrors the row shape of the `notifications` table in the database. */
export interface NotificationRecord {
  id: string;
  user_id: string | null;
  incident_id: string | null;
  notification_type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}

/** Input shape for creating a new notification. */
export interface CreateNotificationInput {
  user_id?: string;
  incident_id?: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

// ============================================================
// Service
// ============================================================

export class NotificationService {
  private io: Server | null = null;

  /**
   * Wire in the Socket.IO server so this service can push realtime
   * delivery whenever a notification is persisted to the database.
   *
   * Must be called once during server startup, from setupSocketServer.
   */
  setSocketServer(io: Server): void {
    this.io = io;
  }

  /**
   * Persist a notification record and deliver it in realtime.
   *
   * Delivery targets:
   * - `user:{user_id}` room  (if user_id provided)
   * - `command_center` room  (always — dispatchers must see all alerts)
   */
  async create(input: CreateNotificationInput): Promise<NotificationRecord> {
    const res = await query(
      `INSERT INTO notifications (user_id, incident_id, notification_type, title, message, data)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        input.user_id ?? null,
        input.incident_id ?? null,
        input.notification_type,
        input.title,
        input.message,
        JSON.stringify(input.data ?? {}),
      ]
    );

    const notification = res.rows[0] as NotificationRecord;

    if (this.io) {
      if (input.user_id) {
        this.io.to(`user:${input.user_id}`).emit('notification:new', notification);
      }
      this.io.to('command_center').emit('notification:new', notification);
    }

    return notification;
  }

  /**
   * Retrieve all unread notifications for a specific user,
   * ordered newest first.
   */
  async getUnreadForUser(userId: string): Promise<NotificationRecord[]> {
    const res = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1 AND is_read = FALSE
       ORDER BY created_at DESC`,
      [userId]
    );
    return res.rows as NotificationRecord[];
  }

  /**
   * Retrieve recent notifications for a user (read + unread).
   */
  async getForUser(userId: string, limit = 50): Promise<NotificationRecord[]> {
    const res = await query(
      `SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );
    return res.rows as NotificationRecord[];
  }

  /**
   * Mark a single notification as read.
   * Returns null if the notification is not found or does not belong
   * to the specified user (RLS enforcement at the service layer).
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationRecord | null> {
    const res = await query(
      `UPDATE notifications
       SET is_read = TRUE, read_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [notificationId, userId]
    );
    return (res.rows[0] as NotificationRecord) ?? null;
  }

  /**
   * Mark all unread notifications for a user as read.
   * Returns the number of rows updated.
   */
  async markAllReadForUser(userId: string): Promise<number> {
    const res = await query(
      `UPDATE notifications
       SET is_read = TRUE, read_at = NOW()
       WHERE user_id = $1 AND is_read = FALSE`,
      [userId]
    );
    return res.rowCount ?? 0;
  }

  /**
   * Persist a system-level alert (no specific user) and broadcast it
   * to the command center room.
   *
   * Used by: incidentEscalationJob, stale GPS detection, system health.
   */
  async broadcastSystemAlert(
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<NotificationRecord> {
    const res = await query(
      `INSERT INTO notifications (notification_type, title, message, data)
       VALUES ('system_alert', $1, $2, $3)
       RETURNING *`,
      [title, message, JSON.stringify(data ?? {})]
    );

    const notification = res.rows[0] as NotificationRecord;

    if (this.io) {
      this.io.to('command_center').emit('notification:system_alert', notification);
    }

    return notification;
  }

  /**
   * Retrieve all notifications related to a specific incident.
   * Useful for the command center incident detail panel.
   */
  async getForIncident(incidentId: string): Promise<NotificationRecord[]> {
    const res = await query(
      `SELECT * FROM notifications
       WHERE incident_id = $1
       ORDER BY created_at DESC`,
      [incidentId]
    );
    return res.rows as NotificationRecord[];
  }
}

export const notificationService = new NotificationService();
