// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Notification Client Types (socket-delivered; no REST route)
// ============================================================

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

/** Mirrors the backend notifications table / socket payload. */
export interface NotificationRecord {
  id: string;
  user_id: string | null;
  incident_id: string | null;
  notification_type: NotificationType | string;
  title: string;
  message: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
}
