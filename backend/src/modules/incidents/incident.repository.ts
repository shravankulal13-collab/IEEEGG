// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Incident Spatial & State Data Access Repository
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { query } from '../../config/database.js';
import type {
  EmergencyType,
  IncidentLocationUpdateRecord,
  IncidentRecord,
  IncidentStatus,
  IncidentVerificationRecord,
  VerificationStatus,
} from './incident.types.js';
import type { ListIncidentsQuery } from './incident.validator.js';

export class IncidentRepository {
  async create(data: {
    reportedBy: string | null;
    emergencyType: EmergencyType;
    title?: string;
    description?: string;
    latitude: number;
    longitude: number;
    severity?: number;
    peopleAffected?: number;
    address?: string;
    landmark?: string;
    city?: string;
    state?: string;
    country?: string;
    source?: string;
    metadata?: Record<string, unknown>;
  }): Promise<IncidentRecord> {
    const id = uuidv4();
    const now = new Date();

    const res = await query<IncidentRecord>(
      `INSERT INTO incidents (
        id, reported_by, emergency_type, title, description,
        status, verification_status, severity, people_affected,
        latitude, longitude, address, landmark, city, state, country,
        source, metadata, reported_at, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, 'reported', 'pending', $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $17, $17)
      RETURNING *`,
      [
        id,
        data.reportedBy,
        data.emergencyType,
        data.title || null,
        data.description || null,
        data.severity || 3,
        data.peopleAffected || 1,
        data.latitude,
        data.longitude,
        data.address || null,
        data.landmark || null,
        data.city || null,
        data.state || null,
        data.country || 'India',
        data.source || 'citizen_app',
        JSON.stringify(data.metadata || {}),
        now,
      ]
    );

    return res.rows[0] || ({
      id,
      reported_by: data.reportedBy,
      emergency_type: data.emergencyType,
      title: data.title || null,
      description: data.description || null,
      status: 'reported',
      verification_status: 'pending',
      severity: data.severity || 3,
      people_affected: data.peopleAffected || 1,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address || null,
      reported_at: now,
      created_at: now,
      updated_at: now,
    } as any);
  }

  async findById(id: string): Promise<IncidentRecord | null> {
    const res = await query<IncidentRecord>('SELECT * FROM incidents WHERE id = $1 LIMIT 1', [id]);
    return res.rows[0] || null;
  }

  async findByIncidentNumber(num: number): Promise<IncidentRecord | null> {
    const res = await query<IncidentRecord>('SELECT * FROM incidents WHERE incident_number = $1 LIMIT 1', [num]);
    return res.rows[0] || null;
  }

  async list(filters: ListIncidentsQuery): Promise<{ items: IncidentRecord[]; total: number }> {
    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 20;
    const offset = (page - 1) * limit;

    const conditions: string[] = [];
    const params: any[] = [];
    let pIdx = 1;

    if (filters.status) {
      conditions.push(`status = $${pIdx++}`);
      params.push(filters.status);
    }
    if (filters.emergencyType) {
      conditions.push(`emergency_type = $${pIdx++}`);
      params.push(filters.emergencyType);
    }
    if (filters.verificationStatus) {
      conditions.push(`verification_status = $${pIdx++}`);
      params.push(filters.verificationStatus);
    }
    if (filters.city) {
      conditions.push(`LOWER(city) = LOWER($${pIdx++})`);
      params.push(filters.city);
    }
    if (filters.severity !== undefined) {
      conditions.push(`severity = $${pIdx++}`);
      params.push(Number(filters.severity));
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const countRes = await query<{ count: string }>(`SELECT COUNT(*) as count FROM incidents ${whereClause}`, params);
    const total = parseInt(countRes.rows[0]?.count || '0', 10);

    const dataRes = await query<IncidentRecord>(
      `SELECT * FROM incidents ${whereClause} ORDER BY reported_at DESC LIMIT $${pIdx++} OFFSET $${pIdx}`,
      [...params, limit, offset]
    );

    return { items: dataRes.rows || [], total: total || dataRes.rows.length };
  }

  async updateStatus(
    id: string,
    status: IncidentStatus,
    extra?: {
      verificationStatus?: VerificationStatus;
      verificationScore?: number;
      cancellationReason?: string;
      verifiedAt?: Date;
      resolvedAt?: Date;
      cancelledAt?: Date;
    }
  ): Promise<IncidentRecord | null> {
    const now = new Date();

    const res = await query<IncidentRecord>(
      `UPDATE incidents
       SET status = $1,
           verification_status = COALESCE($2, verification_status),
           verification_score = COALESCE($3, verification_score),
           cancellation_reason = COALESCE($4, cancellation_reason),
           verified_at = COALESCE($5, verified_at),
           resolved_at = COALESCE($6, resolved_at),
           cancelled_at = COALESCE($7, cancelled_at),
           updated_at = $8
       WHERE id = $9
       RETURNING *`,
      [
        status,
        extra?.verificationStatus || null,
        extra?.verificationScore || null,
        extra?.cancellationReason || null,
        extra?.verifiedAt || null,
        extra?.resolvedAt || null,
        extra?.cancelledAt || null,
        now,
        id,
      ]
    );

    return res.rows[0] || null;
  }

  async addVerification(data: {
    incidentId: string;
    verifierUserId: string | null;
    verificationMethod: string;
    result: VerificationStatus;
    confidenceScore?: number;
    evidence?: Record<string, unknown>;
    notes?: string;
  }): Promise<IncidentVerificationRecord> {
    const id = uuidv4();
    const now = new Date();

    const res = await query<IncidentVerificationRecord>(
      `INSERT INTO incident_verifications (
        id, incident_id, verifier_user_id, verification_method,
        result, confidence_score, evidence, notes, verified_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        id,
        data.incidentId,
        data.verifierUserId,
        data.verificationMethod,
        data.result,
        data.confidenceScore ?? 100,
        JSON.stringify(data.evidence || {}),
        data.notes || null,
        now,
      ]
    );

    return res.rows[0] || ({
      id,
      incident_id: data.incidentId,
      verifier_user_id: data.verifierUserId,
      verification_method: data.verificationMethod,
      result: data.result,
      confidence_score: data.confidenceScore ?? 100,
      evidence: data.evidence || {},
      notes: data.notes || null,
      verified_at: now,
    } as any);
  }

  async recordLocationUpdate(data: {
    incidentId: string;
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
    speedKmh?: number;
    heading?: number;
  }): Promise<IncidentLocationUpdateRecord> {
    const id = uuidv4();
    const now = new Date();

    const res = await query<IncidentLocationUpdateRecord>(
      `INSERT INTO incident_location_updates (
        id, incident_id, latitude, longitude, accuracy_meters, speed_kmh, heading, recorded_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [
        id,
        data.incidentId,
        data.latitude,
        data.longitude,
        data.accuracyMeters || null,
        data.speedKmh || null,
        data.heading || null,
        now,
      ]
    );

    return res.rows[0] || ({
      id,
      incident_id: data.incidentId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy_meters: data.accuracyMeters || null,
      speed_kmh: data.speedKmh || null,
      heading: data.heading || null,
      recorded_at: now,
    } as any);
  }

  async findNearbyIncidents(
    latitude: number,
    longitude: number,
    radiusKm = 0.5,
    windowMinutes = 30
  ): Promise<IncidentRecord[]> {
    const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000);

    const res = await query<IncidentRecord>(
      `SELECT * FROM incidents
       WHERE reported_at >= $1
         AND status NOT IN ('resolved', 'cancelled', 'false_report', 'expired')
       ORDER BY reported_at DESC`,
      [cutoffTime]
    );

    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    return (res.rows || []).filter((i) => {
      const isRecent = new Date(i.reported_at) >= cutoffTime;
      const isActive = !['resolved', 'cancelled', 'false_report', 'expired'].includes(i.status);
      const isClose =
        Math.abs(i.latitude - latitude) <= latDelta && Math.abs(i.longitude - longitude) <= lngDelta;
      return isRecent && isActive && isClose;
    });
  }
}

export const incidentRepository = new IncidentRepository();
