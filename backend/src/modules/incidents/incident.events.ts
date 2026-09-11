// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Incident Event Stream Publisher
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

/**
 * Canonical Socket.IO event name constants for the incident lifecycle.
 *
 * All emitters and consumers MUST use these constants.
 * Do NOT use raw string literals for incident event names elsewhere in
 * the codebase — this ensures a single point of truth and prevents
 * typo-driven mismatches between producers and consumers.
 */
export const INCIDENT_EVENTS = {
  CREATED: 'incident:created',
  STATUS_CHANGED: 'incident:status_changed',
  PRIORITY_CHANGED: 'incident:priority_changed',
  VERIFIED: 'incident:verified',
  DISPATCHED: 'incident:dispatched',
  ESCALATED: 'incident:escalated',
  RESOLVED: 'incident:resolved',
  CANCELLED: 'incident:cancelled',
} as const;

export type IncidentEventName = (typeof INCIDENT_EVENTS)[keyof typeof INCIDENT_EVENTS];

// ============================================================
// Typed Payload Interfaces
// Every event emission must conform to the shape defined here.
// ============================================================

/** Emitted when a new incident is first reported. */
export interface IncidentCreatedPayload {
  incident_id: string;
  incident_number: number;
  emergency_type: string;
  status: string;
  severity: number | null;
  latitude: number;
  longitude: number;
  address: string | null;
  city: string | null;
  reported_at: string;
}

/** Emitted whenever an incident's status field changes. */
export interface IncidentStatusChangedPayload {
  incident_id: string;
  incident_number: number;
  previous_status: string;
  new_status: string;
  emergency_type: string;
  changed_at: string;
}

/** Emitted when the severity (1–5) of an incident is adjusted. */
export interface IncidentPriorityChangedPayload {
  incident_id: string;
  incident_number: number;
  previous_severity: number | null;
  new_severity: number | null;
  changed_at: string;
}

/** Emitted when an incident completes the verification step. */
export interface IncidentVerifiedPayload {
  incident_id: string;
  incident_number: number;
  verification_status: string;
  verification_score: number | null;
  verified_at: string;
}

/** Emitted when an ambulance is dispatched to the incident. */
export interface IncidentDispatchedPayload {
  incident_id: string;
  incident_number: number;
  dispatch_id: string;
  ambulance_id: string;
  ambulance_number: string;
  estimated_eta_seconds: number | null;
  dispatched_at: string;
}

/**
 * Emitted by the escalation job when an incident breaches its SLA
 * threshold without progressing through the expected lifecycle.
 */
export interface IncidentEscalatedPayload {
  incident_id: string;
  incident_number: number;
  current_status: string;
  severity: number | null;
  minutes_since_reported: number;
  escalation_reason: string;
  escalated_at: string;
}

/** Emitted when an incident is marked resolved. */
export interface IncidentResolvedPayload {
  incident_id: string;
  incident_number: number;
  emergency_type: string;
  resolved_at: string;
  total_duration_seconds: number | null;
}

/** Emitted when an incident is cancelled or marked as a false report. */
export interface IncidentCancelledPayload {
  incident_id: string;
  incident_number: number;
  cancellation_reason: string | null;
  cancelled_at: string;
}
