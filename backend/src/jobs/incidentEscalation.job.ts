// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Incident SLA Escalation & Alert Job
// ============================================================

import { query } from '../config/database';
import { notificationService } from '../modules/notifications/notification.service';

// ============================================================
// Escalation thresholds
// Tune these values to match operational SLA policy.
// ============================================================

/** Minutes an incident may stay in 'reported' before escalation. */
const REPORTED_ESCALATION_MINUTES = 10;

/** Minutes an incident may stay in 'verifying' before escalation. */
const VERIFYING_ESCALATION_MINUTES = 15;

/** Minutes an incident may stay in 'verified'/'dispatching' before escalation. */
const AWAITING_DISPATCH_ESCALATION_MINUTES = 10;

/** Minutes after dispatch with no arrival before escalation. */
const DISPATCH_NO_ARRIVAL_ESCALATION_MINUTES = 30;

// ============================================================
// Internal types
// ============================================================

interface EscalationCandidate {
  id: string;
  incident_number: number;
  status: string;
  emergency_type: string;
  severity: number | null;
  reported_at: Date;
  minutes_since_reported: number;
  escalation_reason: string;
}

interface StuckDispatch {
  incident_id: string;
  incident_number: number;
  dispatch_id: string;
  ambulance_id: string;
  dispatched_at: Date;
  minutes_since_dispatch: number;
  severity: number | null;
}

// ============================================================
// Job class
// ============================================================

export class IncidentEscalationJob {
  /**
   * Check for incidents stuck in early lifecycle stages.
   *
   * Conditions checked:
   *   1. Stuck in 'reported'  > REPORTED_ESCALATION_MINUTES
   *   2. Stuck in 'verifying' > VERIFYING_ESCALATION_MINUTES
   *   3. Stuck in 'verified' or 'dispatching' > AWAITING_DISPATCH_ESCALATION_MINUTES
   */
  async detectStuckIncidents(): Promise<EscalationCandidate[]> {
    const res = await query(
      `SELECT
         id,
         incident_number,
         status,
         emergency_type,
         severity,
         reported_at,
         EXTRACT(EPOCH FROM (NOW() - reported_at)) / 60 AS minutes_since_reported
       FROM incidents
       WHERE
         (
           status = 'reported'
           AND reported_at < NOW() - ($1 * INTERVAL '1 minute')
         )
         OR (
           status = 'verifying'
           AND reported_at < NOW() - ($2 * INTERVAL '1 minute')
         )
         OR (
           status IN ('verified', 'dispatching')
           AND reported_at < NOW() - ($3 * INTERVAL '1 minute')
         )
       ORDER BY severity ASC NULLS LAST, reported_at ASC`,
      [
        REPORTED_ESCALATION_MINUTES,
        VERIFYING_ESCALATION_MINUTES,
        AWAITING_DISPATCH_ESCALATION_MINUTES,
      ]
    );

    return res.rows.map((row) => {
      let reason = 'Incident not progressing through lifecycle';
      if (row.status === 'reported') {
        reason = `Incident stuck in "reported" for over ${REPORTED_ESCALATION_MINUTES} minutes`;
      } else if (row.status === 'verifying') {
        reason = `Incident stuck in "verifying" for over ${VERIFYING_ESCALATION_MINUTES} minutes`;
      } else if (row.status === 'verified' || row.status === 'dispatching') {
        reason = `Incident awaiting dispatch for over ${AWAITING_DISPATCH_ESCALATION_MINUTES} minutes`;
      }

      return {
        id: row.id,
        incident_number: parseInt(row.incident_number, 10),
        status: row.status,
        emergency_type: row.emergency_type,
        severity: row.severity !== null ? parseInt(row.severity, 10) : null,
        reported_at: new Date(row.reported_at),
        minutes_since_reported: Math.round(parseFloat(row.minutes_since_reported)),
        escalation_reason: reason,
      };
    });
  }

  /**
   * Check for active dispatches where the ambulance has not yet
   * arrived at the scene within the expected time window.
   */
  async detectNoArrivalDispatches(): Promise<StuckDispatch[]> {
    const res = await query(
      `SELECT
         d.incident_id,
         i.incident_number,
         d.id                                              AS dispatch_id,
         d.ambulance_id,
         d.dispatched_at,
         EXTRACT(EPOCH FROM (NOW() - d.dispatched_at)) / 60 AS minutes_since_dispatch,
         i.severity
       FROM dispatches d
       JOIN incidents i ON d.incident_id = i.id
       WHERE d.status IN ('assigned', 'accepted', 'en_route')
         AND d.arrived_at IS NULL
         AND d.dispatched_at IS NOT NULL
         AND d.dispatched_at < NOW() - ($1 * INTERVAL '1 minute')
       ORDER BY i.severity ASC NULLS LAST, d.dispatched_at ASC`,
      [DISPATCH_NO_ARRIVAL_ESCALATION_MINUTES]
    );

    return res.rows.map((row) => ({
      incident_id: row.incident_id,
      incident_number: parseInt(row.incident_number, 10),
      dispatch_id: row.dispatch_id,
      ambulance_id: row.ambulance_id,
      dispatched_at: new Date(row.dispatched_at),
      minutes_since_dispatch: Math.round(parseFloat(row.minutes_since_dispatch)),
      severity: row.severity !== null ? parseInt(row.severity, 10) : null,
    }));
  }

  /**
   * Run one full escalation check cycle:
   *   1. Find stuck incidents → notify command center
   *   2. Find overdue dispatches → notify command center
   *
   * Notifications are persisted to the database and broadcast via
   * the notification service (which pushes to the command_center
   * socket room if io has been wired in).
   *
   * Errors are caught per-incident so one bad row does not abort
   * the entire cycle.
   */
  async runEscalationCycle(): Promise<void> {
    // --- Stuck incidents ---
    let stuckIncidents: EscalationCandidate[] = [];
    try {
      stuckIncidents = await this.detectStuckIncidents();
    } catch {
      // DB error — skip this cycle rather than crashing
      return;
    }

    for (const incident of stuckIncidents) {
      try {
        await notificationService.broadcastSystemAlert(
          `⚠️ Incident #${incident.incident_number} Requires Attention`,
          `${incident.escalation_reason}. Status: ${incident.status}. ` +
            `Type: ${incident.emergency_type}. ` +
            `${incident.minutes_since_reported} min since reported.`,
          {
            incident_id: incident.id,
            incident_number: incident.incident_number,
            current_status: incident.status,
            severity: incident.severity,
            minutes_since_reported: incident.minutes_since_reported,
            escalation_reason: incident.escalation_reason,
            escalated_at: new Date().toISOString(),
          }
        );
      } catch {
        // Continue with remaining incidents
      }
    }

    // --- No-arrival dispatches ---
    let overdueDispatches: StuckDispatch[] = [];
    try {
      overdueDispatches = await this.detectNoArrivalDispatches();
    } catch {
      return;
    }

    for (const dispatch of overdueDispatches) {
      try {
        await notificationService.broadcastSystemAlert(
          `🚨 Ambulance Not Yet On Scene — Incident #${dispatch.incident_number}`,
          `Ambulance dispatched ${dispatch.minutes_since_dispatch} minutes ago ` +
            `but has not arrived at scene. Dispatch ID: ${dispatch.dispatch_id}.`,
          {
            incident_id: dispatch.incident_id,
            incident_number: dispatch.incident_number,
            dispatch_id: dispatch.dispatch_id,
            ambulance_id: dispatch.ambulance_id,
            minutes_since_dispatch: dispatch.minutes_since_dispatch,
            severity: dispatch.severity,
            escalated_at: new Date().toISOString(),
          }
        );
      } catch {
        // Continue
      }
    }
  }

  /**
   * Start the periodic escalation check.
   * Follows the same pattern as staleGpsJob.startPeriodicCheck().
   *
   * @param intervalMs Milliseconds between checks. Default: 60 seconds.
   * @returns The NodeJS.Timeout handle (call clearInterval to stop).
   */
  startPeriodicCheck(intervalMs = 60000): NodeJS.Timeout {
    return setInterval(async () => {
      await this.runEscalationCycle();
    }, intervalMs);
  }
}

export const incidentEscalationJob = new IncidentEscalationJob();
