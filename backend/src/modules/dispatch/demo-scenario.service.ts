// ============================================================
// PRIMARY OWNER: Anush KD / SK / Shreevarsha V Hegde
// ROLE: Traffic + Routing + Simulation Engine
// MODULE: Controlled Demo Scenario & Traffic Event Injection Service
// ============================================================

import { query } from '../../config/database.js';
import { auditService } from '../audit/audit.service.js';
import { logger } from '../../config/logger.js';

export interface InjectedTrafficEvent {
  id: string;
  incidentId?: string;
  routeId?: string;
  eventType: 'ROAD_BLOCKAGE' | 'HEAVY_CONGESTION' | 'ROUTE_UNAVAILABLE' | 'ACCIDENT_AHEAD' | 'NORMAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  roadName: string;
  addedDelayMinutes: number;
  durationMinutes: number;
  description: string;
  source: 'SIMULATION';
  recommendedAlternativeRoute: {
    id: string;
    name: string;
    distanceKm: number;
    durationMinutes: number;
    delaySavingsMinutes: number;
  };
  injectedAt: string;
  expiresAt: string;
}

// In-memory active simulation store
let activeSimulatedEvents: InjectedTrafficEvent[] = [];

export class DemoScenarioService {
  public async injectTrafficEvent(payload: {
    incidentId?: string;
    routeId?: string;
    eventType?: string;
    severity?: string;
    roadName?: string;
    addedDelayMinutes?: number;
    durationMinutes?: number;
    description?: string;
  }): Promise<InjectedTrafficEvent> {
    const eventType = (payload.eventType?.toUpperCase() || 'ROAD_BLOCKAGE') as InjectedTrafficEvent['eventType'];
    const severity = (payload.severity?.toUpperCase() || 'HIGH') as InjectedTrafficEvent['severity'];
    const roadName = payload.roadName || 'Richmond Circle Arterial Corridor';
    const addedDelay = payload.addedDelayMinutes !== undefined ? Number(payload.addedDelayMinutes) : 3;
    const durationMin = payload.durationMinutes !== undefined ? Number(payload.durationMinutes) : 30;
    const description = payload.description || `Traffic blockage detected on ${roadName}. Estimated delay +${addedDelay} min.`;

    const eventId = `SIM-TRAFFIC-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + durationMin * 60000);

    const event: InjectedTrafficEvent = {
      id: eventId,
      incidentId: payload.incidentId || 'ER-77',
      routeId: payload.routeId || 'ROUTE-PRIMARY',
      eventType,
      severity,
      roadName,
      addedDelayMinutes: addedDelay,
      durationMinutes: durationMin,
      description,
      source: 'SIMULATION',
      recommendedAlternativeRoute: {
        id: 'route-bypass-elevated',
        name: 'Elevated Flyover Bypass Corridor',
        distanceKm: 3.2,
        durationMinutes: 5,
        delaySavingsMinutes: 2,
      },
      injectedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    // If NORMAL scenario selected, clear existing blockages
    if (eventType === 'NORMAL') {
      activeSimulatedEvents = [];
    } else {
      activeSimulatedEvents = [event, ...activeSimulatedEvents.slice(0, 4)];
    }

    // Persist to database traffic_events if table accessible
    try {
      await query(
        `INSERT INTO traffic_events (
          id, provider, road_name, severity, description, delay_seconds, blocked, detected_at, raw_data
        ) VALUES (
          gen_random_uuid(), 'fallback', $1, $2, $3, $4, $5, NOW(), $6
        )`,
        [
          roadName,
          severity === 'HIGH' || severity === 'CRITICAL' ? 'severe' : 'moderate',
          description,
          addedDelay * 60,
          eventType === 'ROAD_BLOCKAGE' || eventType === 'ROUTE_UNAVAILABLE',
          JSON.stringify({ source: 'SIMULATION', mode: 'DEMO', eventId, eventType }),
        ]
      );
    } catch {
      // ignore
    }

    // Log to audit log
    await auditService.logEvent({
      action: 'TRAFFIC_EVENT_DETECTED',
      entityType: 'traffic_events',
      incidentId: payload.incidentId,
      actorName: 'Dispatcher Scenario Controls',
      reason: `Simulated ${eventType} injected on ${roadName} (+${addedDelay} min delay). Rerouting alternative evaluated.`,
      details: {
        eventType,
        severity,
        roadName,
        addedDelayMinutes: addedDelay,
        source: 'SIMULATION',
      },
    }).catch(() => {});

    logger.info({ eventId, eventType, roadName }, 'Injected controlled traffic simulation event');
    return event;
  }

  public getActiveTrafficEvents(): InjectedTrafficEvent[] {
    const now = new Date().getTime();
    activeSimulatedEvents = activeSimulatedEvents.filter(
      (e) => new Date(e.expiresAt).getTime() > now
    );
    return activeSimulatedEvents;
  }

  public async resetDemoScenario(): Promise<{
    success: boolean;
    message: string;
    resetEntities: Record<string, any>;
  }> {
    activeSimulatedEvents = [];

    // 1. Reset hospital capacities in DB
    try {
      // Apollo / Victoria: 3 ICU beds available
      await query(
        `UPDATE hospitals 
         SET available_icu_beds = 3, available_beds = 45, emergency_department = true, status = 'active'
         WHERE id = 'b0000000-0000-0000-0000-000000000001' OR name ILIKE '%Apollo%'`
      );
      // Fortis: 0 ICU beds (to demonstrate constraint rejection)
      await query(
        `UPDATE hospitals 
         SET available_icu_beds = 0, available_beds = 28, emergency_department = true, status = 'active'
         WHERE id = 'b0000000-0000-0000-0000-000000000002' OR name ILIKE '%Fortis%'`
      );
      // Victoria Hospital: Level 1 Trauma with 14 ICU beds
      await query(
        `UPDATE hospitals 
         SET available_icu_beds = 14, available_beds = 85, emergency_department = true, status = 'active', trauma_center = true
         WHERE id = 'b0000000-0000-0000-0000-000000000004' OR name ILIKE '%Victoria%'`
      );
      // Ambulance AMB-104 reset to available
      await query(
        `UPDATE ambulances 
         SET status = 'available', current_incident_id = NULL, current_hospital_id = NULL,
             current_latitude = 12.9340, current_longitude = 77.6100
         WHERE id = 'c0000000-0000-0000-0000-000000000002' OR ambulance_number ILIKE '%104%'`
      );
    } catch (err: any) {
      logger.warn({ error: err.message }, 'Failed to reset PostgreSQL demo state, continuing');
    }

    // Log reset audit event
    await auditService.logEvent({
      action: 'DEMO_SCENARIO_RESET',
      entityType: 'system',
      actorName: 'Dispatcher Scenario Controls',
      reason: 'Demo scenario deterministic baseline restored (Hospitals A/B/C capacities, Ambulance AMB-104 Standby, Traffic cleared).',
    }).catch(() => {});

    return {
      success: true,
      message: 'Master Demo Scenario reset to initial baseline successfully.',
      resetEntities: {
        hospitalA: 'Apollo / Victoria (Emergency: YES, ICU: 3-14, Trauma: YES) - ELIGIBLE',
        hospitalB: 'Fortis Cunningham (Emergency: YES, ICU: 0, Trauma: YES) - REJECTED (ICU constraint)',
        hospitalC: 'City Care Clinic (Emergency: NO) - REJECTED (No Emergency Dept)',
        ambulance: 'AMB-104 (ALS Unit, Status: AVAILABLE)',
        traffic: 'NORMAL (All simulated road blockages cleared)',
        activeIncident: 'ER-77 (Ready for SOS broadcast)',
      },
    };
  }
}

export const demoScenarioService = new DemoScenarioService();
