// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Emergency Alert & Notification Service
// ============================================================

import { query, pool, isPostgresConnected } from '../../config/database.js';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

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

export interface CreateNotificationInput {
  user_id?: string;
  incident_id?: string;
  notification_type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
}

const fallbackNotifications: NotificationRecord[] = [];

export class NotificationService {
  private io: Server | null = null;

  setSocketServer(io: Server): void {
    this.io = io;
  }

  async create(input: CreateNotificationInput): Promise<NotificationRecord> {
    const id = uuidv4();
    const now = new Date().toISOString();

    let notification: NotificationRecord = {
      id,
      user_id: input.user_id ?? null,
      incident_id: input.incident_id ?? null,
      notification_type: input.notification_type,
      title: input.title,
      message: input.message,
      data: input.data ?? {},
      is_read: false,
      created_at: now,
      read_at: null,
    };

    if (pool && isPostgresConnected) {
      try {
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
        if (res.rows[0]) {
          notification = res.rows[0] as NotificationRecord;
        }
      } catch {
        fallbackNotifications.push(notification);
      }
    } else {
      fallbackNotifications.push(notification);
    }

    if (this.io) {
      if (input.user_id) {
        this.io.to(`user:${input.user_id}`).emit('notification:new', notification);
      }
      this.io.to('command_center').emit('notification:new', notification);
    }

    return notification;
  }

  async getUnreadForUser(userId: string): Promise<NotificationRecord[]> {
    if (pool && isPostgresConnected) {
      try {
        const res = await query(
          `SELECT * FROM notifications
           WHERE user_id = $1 AND is_read = FALSE
           ORDER BY created_at DESC`,
          [userId]
        );
        return res.rows as NotificationRecord[];
      } catch {
        // Fallback
      }
    }
    return fallbackNotifications.filter((n) => n.user_id === userId && !n.is_read);
  }

  async getForUser(userId: string, limit = 50): Promise<NotificationRecord[]> {
    if (pool && isPostgresConnected) {
      try {
        const res = await query(
          `SELECT * FROM notifications
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT $2`,
          [userId, limit]
        );
        return res.rows as NotificationRecord[];
      } catch {
        // Fallback
      }
    }
    return fallbackNotifications
      .filter((n) => n.user_id === userId)
      .slice(0, limit);
  }

  async markAsRead(notificationId: string, userId: string): Promise<NotificationRecord | null> {
    if (pool && isPostgresConnected) {
      try {
        const res = await query(
          `UPDATE notifications
           SET is_read = TRUE, read_at = NOW()
           WHERE id = $1 AND user_id = $2
           RETURNING *`,
          [notificationId, userId]
        );
        return (res.rows[0] as NotificationRecord) ?? null;
      } catch {
        // Fallback
      }
    }

    const n = fallbackNotifications.find((item) => item.id === notificationId && item.user_id === userId);
    if (n) {
      n.is_read = true;
      n.read_at = new Date().toISOString();
      return n;
    }
    return null;
  }

  async markAllReadForUser(userId: string): Promise<number> {
    if (pool && isPostgresConnected) {
      try {
        const res = await query(
          `UPDATE notifications
           SET is_read = TRUE, read_at = NOW()
           WHERE user_id = $1 AND is_read = FALSE`,
          [userId]
        );
        return res.rowCount ?? 0;
      } catch {
        // Fallback
      }
    }

    let count = 0;
    const now = new Date().toISOString();
    for (const n of fallbackNotifications) {
      if (n.user_id === userId && !n.is_read) {
        n.is_read = true;
        n.read_at = now;
        count++;
      }
    }
    return count;
  }

  async broadcastSystemAlert(
    title: string,
    message: string,
    data?: Record<string, unknown>
  ): Promise<NotificationRecord> {
    const id = uuidv4();
    const now = new Date().toISOString();

    let notification: NotificationRecord = {
      id,
      user_id: null,
      incident_id: null,
      notification_type: 'system_alert',
      title,
      message,
      data: data ?? {},
      is_read: false,
      created_at: now,
      read_at: null,
    };

    if (pool && isPostgresConnected) {
      try {
        const res = await query(
          `INSERT INTO notifications (notification_type, title, message, data)
           VALUES ('system_alert', $1, $2, $3)
           RETURNING *`,
          [title, message, JSON.stringify(data ?? {})]
        );
        if (res.rows[0]) {
          notification = res.rows[0] as NotificationRecord;
        }
      } catch {
        fallbackNotifications.push(notification);
      }
    } else {
      fallbackNotifications.push(notification);
    }

    if (this.io) {
      this.io.to('command_center').emit('notification:system_alert', notification);
    }

    return notification;
  }

  async getForIncident(incidentId: string): Promise<NotificationRecord[]> {
    if (pool && isPostgresConnected) {
      try {
        const res = await query(
          `SELECT * FROM notifications
           WHERE incident_id = $1
           ORDER BY created_at DESC`,
          [incidentId]
        );
        return res.rows as NotificationRecord[];
      } catch {
        // Fallback
      }
    }
    return fallbackNotifications.filter((n) => n.incident_id === incidentId);
  }
}

export const notificationService = new NotificationService();
