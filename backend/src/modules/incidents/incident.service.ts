// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Incident Business Logic, State Machine & Verification
// ============================================================

import { logger } from '../../config/logger.js';
import { AppError, NotFoundError, ValidationError } from '../../middleware/error.middleware.js';
import { incidentRepository } from './incident.repository.js';
import type {
  IncidentRecord,
  IncidentStatus,
  IncidentVerificationRecord,
  VerificationStatus,
} from './incident.types.js';
import type {
  CancelIncidentInput,
  CreateIncidentInput,
  ListIncidentsQuery,
  RecordLocationInput,
  UpdateIncidentStatusInput,
  VerifyIncidentInput,
} from './incident.validator.js';

// Valid status transitions for emergency state machine
const ALLOWED_STATUS_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  reported: ['verifying', 'verified', 'cancelled', 'false_report'],
  verifying: ['verified', 'rejected' as any, 'cancelled', 'false_report'],
  verified: ['dispatching', 'dispatched', 'cancelled'],
  dispatching: ['dispatched', 'cancelled'],
  dispatched: ['en_route', 'cancelled'],
  en_route: ['arrived', 'cancelled'],
  arrived: ['transporting', 'resolved', 'cancelled'],
  transporting: ['resolved', 'cancelled'],
  resolved: [], // Terminal
  cancelled: [], // Terminal
  false_report: [], // Terminal
  expired: [], // Terminal
};

export class IncidentService {
  async createIncident(input: CreateIncidentInput, reportedBy: string | null): Promise<IncidentRecord> {
    // 1. Geospatial boundary check (India approximate bounding box: Lat 6 to 38, Lng 68 to 98)
    const isWithinIndia =
      input.latitude >= 6.0 &&
      input.latitude <= 38.0 &&
      input.longitude >= 68.0 &&
      input.longitude <= 98.0;

    // 2. Duplicate incident heuristic check (within 500m in last 30 minutes)
    const nearby = await incidentRepository.findNearbyIncidents(input.latitude, input.longitude, 0.5, 30);
    const isPotentialDuplicate = nearby.length > 0;

    const initialMetadata: Record<string, unknown> = {
      ...input.metadata,
      isWithinIndia,
      potentialDuplicate: isPotentialDuplicate,
      nearbyActiveIncidentCount: nearby.length,
      initialDuplicateClusterIds: nearby.map((n) => n.id),
    };

    const incident = await incidentRepository.create({
      reportedBy,
      emergencyType: input.emergencyType,
      title: input.title,
      description: input.description,
      latitude: input.latitude,
      longitude: input.longitude,
      severity: input.severity,
      peopleAffected: input.peopleAffected,
      address: input.address,
      landmark: input.landmark,
      city: input.city,
      state: input.state,
      country: input.country,
      source: input.source,
      metadata: initialMetadata,
    });

    logger.info(
      {
        incidentId: incident.id,
        incidentNumber: incident.incident_number,
        emergencyType: incident.emergency_type,
        isDuplicate: isPotentialDuplicate,
      },
      'Emergency incident successfully logged'
    );

    // Initial automated verification signal
    const initialVerificationScore = this.calculateVerificationScore({
      isWithinIndia,
      isDuplicate: isPotentialDuplicate,
      hasDescription: !!input.description && input.description.length > 10,
      hasAddress: !!input.address,
    });

    if (initialVerificationScore >= 75) {
      await incidentRepository.updateStatus(incident.id, 'reported', {
        verificationStatus: 'pending',
        verificationScore: initialVerificationScore,
      });
    }

    return incident;
  }

  async getIncidentById(id: string): Promise<IncidentRecord> {
    const incident = await incidentRepository.findById(id);
    if (!incident) {
      throw new NotFoundError(`Emergency incident with identifier '${id}' was not found.`);
    }
    return incident;
  }

  async listIncidents(query: ListIncidentsQuery): Promise<{ items: IncidentRecord[]; total: number }> {
    return incidentRepository.list(query);
  }

  async updateIncidentStatus(
    id: string,
    input: UpdateIncidentStatusInput,
    _actorUserId?: string
  ): Promise<IncidentRecord> {
    const incident = await this.getIncidentById(id);

    // Validate state transition
    const allowed = ALLOWED_STATUS_TRANSITIONS[incident.status];
    if (allowed && !allowed.includes(input.status) && incident.status !== input.status) {
      throw new ValidationError(
        `Invalid status transition from '${incident.status}' to '${input.status}'. Allowed transitions: [${allowed.join(', ')}]`
      );
    }

    const extra: {
      verifiedAt?: Date;
      resolvedAt?: Date;
      cancelledAt?: Date;
    } = {};

    if (input.status === 'verified' && !incident.verified_at) {
      extra.verifiedAt = new Date();
    }
    if (input.status === 'resolved' && !incident.resolved_at) {
      extra.resolvedAt = new Date();
    }
    if (input.status === 'cancelled' && !incident.cancelled_at) {
      extra.cancelledAt = new Date();
    }

    const updated = await incidentRepository.updateStatus(id, input.status, extra);
    if (!updated) {
      throw new AppError('Failed to update incident status.', 500);
    }

    logger.info(
      { incidentId: id, previousStatus: incident.status, newStatus: input.status },
      'Incident status transitioned'
    );

    return updated;
  }

  async verifyIncident(
    id: string,
    input: VerifyIncidentInput,
    verifierUserId: string | null
  ): Promise<{ incident: IncidentRecord; verification: IncidentVerificationRecord }> {
    const incident = await this.getIncidentById(id);

    const verification = await incidentRepository.addVerification({
      incidentId: id,
      verifierUserId,
      verificationMethod: input.verificationMethod,
      result: input.result,
      confidenceScore: input.confidenceScore,
      evidence: input.evidence,
      notes: input.notes,
    });

    let newStatus: IncidentStatus = incident.status;
    if (input.result === 'verified') {
      newStatus = incident.status === 'reported' || incident.status === 'verifying' ? 'verified' : incident.status;
    } else if (input.result === 'rejected') {
      newStatus = 'false_report';
    }

    const updated = await incidentRepository.updateStatus(id, newStatus, {
      verificationStatus: input.result,
      verificationScore: input.confidenceScore,
      verifiedAt: input.result === 'verified' ? new Date() : undefined,
    });

    logger.info(
      { incidentId: id, result: input.result, confidence: input.confidenceScore },
      'Incident verification recorded'
    );

    return {
      incident: updated || incident,
      verification,
    };
  }

  async cancelIncident(id: string, input: CancelIncidentInput): Promise<IncidentRecord> {
    const incident = await this.getIncidentById(id);

    if (['resolved', 'cancelled', 'false_report'].includes(incident.status)) {
      throw new ValidationError(`Cannot cancel an incident that is already '${incident.status}'.`);
    }

    const updated = await incidentRepository.updateStatus(id, 'cancelled', {
      cancellationReason: input.cancellationReason,
      cancelledAt: new Date(),
    });

    if (!updated) {
      throw new AppError('Failed to cancel incident', 500);
    }

    logger.info({ incidentId: id, reason: input.cancellationReason }, 'Incident cancelled');
    return updated;
  }

  async recordLocation(id: string, input: RecordLocationInput) {
    await this.getIncidentById(id);
    return incidentRepository.recordLocationUpdate({
      incidentId: id,
      latitude: input.latitude,
      longitude: input.longitude,
      accuracyMeters: input.accuracyMeters,
      speedKmh: input.speedKmh,
      heading: input.heading,
    });
  }

  private calculateVerificationScore(signals: {
    isWithinIndia: boolean;
    isDuplicate: boolean;
    hasDescription: boolean;
    hasAddress: boolean;
  }): number {
    let score = 50; // baseline
    if (signals.isWithinIndia) score += 20;
    if (signals.hasDescription) score += 15;
    if (signals.hasAddress) score += 10;
    if (signals.isDuplicate) score += 5; // Multi-report correlation increases credibility
    return Math.min(100, Math.max(0, score));
  }
}

export const incidentService = new IncidentService();
