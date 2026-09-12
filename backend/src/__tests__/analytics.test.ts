import { describe, it, expect } from 'vitest';
import { INCIDENT_EVENTS } from '../modules/incidents/incident.events.js';
import { NOTIFICATION_CLIENT_EVENTS, NOTIFICATION_SERVER_EVENTS } from '../websocket/notification.socket.js';
import { SOCKET_ROOMS } from '../websocket/socket.server.js';
import { NotificationService } from '../modules/notifications/notification.service.js';
import { IncidentEscalationJob } from '../jobs/incidentEscalation.job.js';

// ============================================================
// A. Incident Event Name Constants
// ============================================================

describe('INCIDENT_EVENTS constants', () => {
  it('should expose all required lifecycle event names', () => {
    expect(INCIDENT_EVENTS.CREATED).toBe('incident:created');
    expect(INCIDENT_EVENTS.STATUS_CHANGED).toBe('incident:status_changed');
    expect(INCIDENT_EVENTS.PRIORITY_CHANGED).toBe('incident:priority_changed');
    expect(INCIDENT_EVENTS.VERIFIED).toBe('incident:verified');
    expect(INCIDENT_EVENTS.DISPATCHED).toBe('incident:dispatched');
    expect(INCIDENT_EVENTS.ESCALATED).toBe('incident:escalated');
    expect(INCIDENT_EVENTS.RESOLVED).toBe('incident:resolved');
    expect(INCIDENT_EVENTS.CANCELLED).toBe('incident:cancelled');
  });

  it('should use the incident: namespace prefix for all events', () => {
    for (const eventName of Object.values(INCIDENT_EVENTS)) {
      expect(eventName).toMatch(/^incident:/);
    }
  });

  it('should have 8 distinct event names', () => {
    const names = new Set(Object.values(INCIDENT_EVENTS));
    expect(names.size).toBe(8);
  });
});

// ============================================================
// B. Notification Socket Event Constants
// ============================================================

describe('NOTIFICATION_CLIENT_EVENTS and NOTIFICATION_SERVER_EVENTS', () => {
  it('should expose client-to-server event names', () => {
    expect(NOTIFICATION_CLIENT_EVENTS.MARK_READ).toBe('notification:mark_read');
    expect(NOTIFICATION_CLIENT_EVENTS.MARK_ALL_READ).toBe('notification:mark_all_read');
  });

  it('should expose server-to-client event names', () => {
    expect(NOTIFICATION_SERVER_EVENTS.NEW).toBe('notification:new');
    expect(NOTIFICATION_SERVER_EVENTS.SYSTEM_ALERT).toBe('notification:system_alert');
    expect(NOTIFICATION_SERVER_EVENTS.MARKED_READ).toBe('notification:marked_read');
    expect(NOTIFICATION_SERVER_EVENTS.ALL_MARKED_READ).toBe('notification:all_marked_read');
    expect(NOTIFICATION_SERVER_EVENTS.ERROR).toBe('notification:error');
  });

  it('should use the notification: namespace prefix', () => {
    const all = [
      ...Object.values(NOTIFICATION_CLIENT_EVENTS),
      ...Object.values(NOTIFICATION_SERVER_EVENTS),
    ];
    for (const name of all) {
      expect(name).toMatch(/^notification:/);
    }
  });
});

// ============================================================
// C. Socket Room Name Helpers
// ============================================================

describe('SOCKET_ROOMS helpers', () => {
  it('COMMAND_CENTER is a static string', () => {
    expect(SOCKET_ROOMS.COMMAND_CENTER).toBe('command_center');
  });

  it('user() generates the correct room name', () => {
    expect(SOCKET_ROOMS.user('abc-123')).toBe('user:abc-123');
    expect(SOCKET_ROOMS.user('user-uuid')).toBe('user:user-uuid');
  });

  it('ambulance() generates the correct room name', () => {
    expect(SOCKET_ROOMS.ambulance('amb-456')).toBe('ambulance:amb-456');
  });

  it('incident() generates the correct room name', () => {
    expect(SOCKET_ROOMS.incident('inc-789')).toBe('incident:inc-789');
  });
});

// ============================================================
// D. NotificationService — unit-testable behaviour
// ============================================================

describe('NotificationService', () => {
  it('can be instantiated without a socket server', () => {
    const svc = new NotificationService();
    expect(svc).toBeDefined();
  });

  it('setSocketServer stores the server without throwing', () => {
    const svc = new NotificationService();
    expect(() => svc.setSocketServer({ to: () => ({ emit: () => {} }) } as any)).not.toThrow();
  });
});

// ============================================================
// E. IncidentEscalationJob — pure / unit-testable behaviour
// ============================================================

describe('IncidentEscalationJob', () => {
  it('can be instantiated', () => {
    const job = new IncidentEscalationJob();
    expect(job).toBeDefined();
  });

  it('startPeriodicCheck returns a NodeJS.Timeout', () => {
    const job = new IncidentEscalationJob();
    job.runEscalationCycle = async () => {};
    const handle = job.startPeriodicCheck(999999);
    expect(handle).toBeDefined();
    clearInterval(handle);
  });
});

// ============================================================
// F. Analytics route parameter validation logic (pure helpers)
// ============================================================

describe('Analytics window parameter validation', () => {
  function parseWindowHours(raw: unknown): number | null {
    const n = parseInt(String(raw ?? '24'), 10);
    if (isNaN(n) || n < 1 || n > 720) return null;
    return n;
  }

  it('should accept a valid window value of 24', () => {
    expect(parseWindowHours('24')).toBe(24);
  });

  it('should accept the minimum window value of 1', () => {
    expect(parseWindowHours('1')).toBe(1);
  });

  it('should accept the maximum window value of 720', () => {
    expect(parseWindowHours('720')).toBe(720);
  });

  it('should return null for 0', () => {
    expect(parseWindowHours('0')).toBeNull();
  });

  it('should return null for values > 720', () => {
    expect(parseWindowHours('721')).toBeNull();
  });

  it('should return null for non-numeric strings', () => {
    expect(parseWindowHours('abc')).toBeNull();
  });

  it('should default to 24 when value is undefined', () => {
    expect(parseWindowHours(undefined)).toBe(24);
  });

  it('should return null for negative values', () => {
    expect(parseWindowHours('-1')).toBeNull();
  });
});
