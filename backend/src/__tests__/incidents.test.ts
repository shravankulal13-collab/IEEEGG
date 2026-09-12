// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Backend Incident Lifecycle & State Machine Unit Tests
// ============================================================

import { describe, expect, it } from 'vitest';
import { incidentService } from '../modules/incidents/incident.service.js';
import {
  createIncidentSchema,
  updateIncidentStatusSchema,
} from '../modules/incidents/incident.validator.js';

describe('Incident Lifecycle & Verification Tests', () => {
  describe('Incident Schema Validation', () => {
    it('validates a correct emergency incident creation payload', () => {
      const valid = {
        emergencyType: 'medical',
        title: 'Cardiac Arrest on MG Road',
        description: 'Patient unresponsive near Metro Pillar 142',
        latitude: 12.9716,
        longitude: 77.5946,
        severity: 5,
        peopleAffected: 1,
        address: 'MG Road, Bangalore',
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
      };
      const result = createIncidentSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects out-of-range coordinates', () => {
      const invalid = {
        emergencyType: 'accident',
        latitude: 95.0,
        longitude: 77.5946,
      };
      const result = createIncidentSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it('validates status update schema', () => {
      const result = updateIncidentStatusSchema.safeParse({
        status: 'verifying',
        notes: 'Contacted reporter to verify emergency details',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Incident Service & State Machine', () => {
    it('creates an emergency incident and calculates initial verification score', async () => {
      const incident = await incidentService.createIncident(
        {
          emergencyType: 'accident',
          title: 'Two-vehicle collision on Outer Ring Road',
          description: 'Car and bike collision near Marathahalli bridge',
          latitude: 12.9569,
          longitude: 77.7011,
          severity: 4,
          peopleAffected: 2,
          address: 'Outer Ring Road, Marathahalli',
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          source: 'citizen_app',
          metadata: {},
        },
        'a0000000-0000-0000-0000-000000000005'
      );

      expect(incident).toBeDefined();
      expect(incident.id).toBeDefined();
      expect(incident.incident_number).toBeGreaterThan(0);
      expect(incident.status).toBe('reported');
      expect(incident.emergency_type).toBe('accident');
      expect(incident.metadata.isWithinIndia).toBe(true);
    });

    it('transitions incident status through valid state machine path', async () => {
      const created = await incidentService.createIncident(
        {
          emergencyType: 'fire',
          title: 'Commercial building fire',
          latitude: 13.0358,
          longitude: 77.597,
          severity: 5,
          peopleAffected: 10,
          city: 'Bangalore',
          country: 'India',
          source: 'citizen_app',
          metadata: {},
        },
        null
      );

      const verifying = await incidentService.updateIncidentStatus(created.id, {
        status: 'verifying',
      });
      expect(verifying.status).toBe('verifying');

      const verified = await incidentService.verifyIncident(
        created.id,
        {
          verificationMethod: 'dispatcher_phone_call',
          result: 'verified',
          confidenceScore: 95,
          evidence: {},
          notes: 'Confirmed by building security guard',
        },
        'a0000000-0000-0000-0000-000000000002'
      );

      expect(verified.incident.status).toBe('verified');
      expect(verified.incident.verification_status).toBe('verified');
    });

    it('rejects invalid state machine transitions', async () => {
      const created = await incidentService.createIncident(
        {
          emergencyType: 'police',
          title: 'Robbery in progress',
          latitude: 12.9279,
          longitude: 77.6271,
          city: 'Bangalore',
          country: 'India',
          source: 'citizen_app',
          metadata: {},
        },
        null
      );

      await expect(
        incidentService.updateIncidentStatus(created.id, {
          status: 'arrived',
        })
      ).rejects.toThrow();
    });

    it('cancels an active incident with cancellation reason', async () => {
      const created = await incidentService.createIncident(
        {
          emergencyType: 'other',
          title: 'Minor tree fall',
          latitude: 12.9141,
          longitude: 77.6109,
          city: 'Bangalore',
          country: 'India',
          source: 'citizen_app',
          metadata: {},
        },
        null
      );

      const cancelled = await incidentService.cancelIncident(created.id, {
        cancellationReason: 'Resolved by local municipal team before dispatch',
      });

      expect(cancelled.status).toBe('cancelled');
      expect(cancelled.cancellation_reason).toBe(
        'Resolved by local municipal team before dispatch'
      );
    });
  });
});
