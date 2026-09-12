// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Incident Data Access & Persistence Repository
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { isPostgresConnected, pool, query } from '../../config/database.js';
import type {
  EmergencyType,
  IncidentLocationUpdateRecord,
  IncidentRecord,
  IncidentStatus,
  IncidentVerificationRecord,
  VerificationStatus,
} from './incident.types.js';
import type { ListIncidentsQuery } from './incident.validator.js';

const fallbackIncidents = new Map<string, IncidentRecord>();
const fallbackVerifications = new Map<string, IncidentVerificationRecord[]>();
const fallbackLocations = new Map<string, IncidentLocationUpdateRecord[]>();

let incidentCounter = 1000;

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
    const incidentNumber = ++incidentCounter;
    const now = new Date();

    if (pool && isPostgresConnected) {
      try {
        const res = await query<IncidentRecord>(
          `INSERT INTO incidents (
            id, incident_number, reported_by, emergency_type, title, description,
            status, verification_status, verification_score, severity, people_affected,
            latitude, longitude, location, address, landmark, city, state, country,
            reported_at, source, metadata, created_at, updated_at
          ) VALUES (
            $1, DEFAULT, $2, $3, $4, $5,
            'reported', 'pending', 0, $6, $7,
            $8, $9, ST_SetSRID(ST_MakePoint($9, $8), 4326), $10, $11, $12, $13, $14,
            $15, $16, $17, $15, $15
          ) RETURNING *`,
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
            now,
            data.source || 'citizen_app',
            JSON.stringify(data.metadata || {}),
          ]
        );
        const record = res.rows[0];
        if (record) {
          fallbackIncidents.set(record.id, record);
          return record;
        }
      } catch {
        // Fallback
      }
    }

    const record: IncidentRecord = {
      id,
      incident_number: incidentNumber,
      reported_by: data.reportedBy,
      emergency_type: data.emergencyType,
      title: data.title || null,
      description: data.description || null,
      status: 'reported',
      verification_status: 'pending',
      verification_score: 0,
      severity: data.severity || 3,
      people_affected: data.peopleAffected || 1,
      latitude: data.latitude,
      longitude: data.longitude,
      address: data.address || null,
      landmark: data.landmark || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || 'India',
      reported_at: now,
      verified_at: null,
      resolved_at: null,
      cancelled_at: null,
      cancellation_reason: null,
      source: data.source || 'citizen_app',
      metadata: data.metadata || {},
      created_at: now,
      updated_at: now,
    };

    fallbackIncidents.set(id, record);
    return record;
  }

  async findById(id: string): Promise<IncidentRecord | null> {
    if (pool && isPostgresConnected) {
      try {
        const res = await query<IncidentRecord>('SELECT * FROM incidents WHERE id = $1 LIMIT 1', [id]);
        return res.rows[0] || null;
      } catch {
        // Fallback
      }
    }
    return fallbackIncidents.get(id) || null;
  }

  async list(filters: ListIncidentsQuery): Promise<{ items: IncidentRecord[]; total: number }> {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const offset = (page - 1) * limit;

    if (pool && isPostgresConnected) {
      try {
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
          params.push(filters.severity);
        }

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
        const countRes = await query<{ count: string }>(`SELECT COUNT(*) as count FROM incidents ${whereClause}`, params);
        const total = parseInt(countRes.rows[0]?.count || '0', 10);

        const dataRes = await query<IncidentRecord>(
          `SELECT * FROM incidents ${whereClause} ORDER BY reported_at DESC LIMIT $${pIdx++} OFFSET $${pIdx}`,
          [...params, limit, offset]
        );

        return { items: dataRes.rows, total };
      } catch {
        // Fallback
      }
    }

    let list = Array.from(fallbackIncidents.values());

    if (filters.status) list = list.filter((i) => i.status === filters.status);
    if (filters.emergencyType) list = list.filter((i) => i.emergency_type === filters.emergencyType);
    if (filters.verificationStatus) list = list.filter((i) => i.verification_status === filters.verificationStatus);
    if (filters.city) list = list.filter((i) => i.city?.toLowerCase() === filters.city?.toLowerCase());
    if (filters.severity !== undefined) list = list.filter((i) => i.severity === Number(filters.severity));

    list.sort((a, b) => new Date(b.reported_at).getTime() - new Date(a.reported_at).getTime());

    const total = list.length;
    const items = list.slice(offset, offset + limit);

    return { items, total };
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
    const incident = await this.findById(id);
    if (!incident) return null;

    if (pool && isPostgresConnected) {
      try {
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
        if (res.rows[0]) {
          fallbackIncidents.set(id, res.rows[0]);
          return res.rows[0];
        }
      } catch {
        // Fallback
      }
    }

    const updated: IncidentRecord = {
      ...incident,
      status,
      verification_status: extra?.verificationStatus ?? incident.verification_status,
      verification_score: extra?.verificationScore ?? incident.verification_score,
      cancellation_reason: extra?.cancellationReason ?? incident.cancellation_reason,
      verified_at: extra?.verifiedAt ?? incident.verified_at,
      resolved_at: extra?.resolvedAt ?? incident.resolved_at,
      cancelled_at: extra?.cancelledAt ?? incident.cancelled_at,
      updated_at: now,
    };

    fallbackIncidents.set(id, updated);
    return updated;
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

    if (pool && isPostgresConnected) {
      try {
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
        if (res.rows[0]) return res.rows[0];
      } catch {
        // Fallback
      }
    }

    const record: IncidentVerificationRecord = {
      id,
      incident_id: data.incidentId,
      verifier_user_id: data.verifierUserId,
      verification_method: data.verificationMethod,
      result: data.result,
      confidence_score: data.confidenceScore ?? 100,
      evidence: data.evidence || {},
      notes: data.notes || null,
      verified_at: now,
    };

    const existing = fallbackVerifications.get(data.incidentId) || [];
    existing.push(record);
    fallbackVerifications.set(data.incidentId, existing);

    return record;
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

    if (pool && isPostgresConnected) {
      try {
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
        if (res.rows[0]) return res.rows[0];
      } catch {
        // Fallback
      }
    }

    const record: IncidentLocationUpdateRecord = {
      id,
      incident_id: data.incidentId,
      latitude: data.latitude,
      longitude: data.longitude,
      accuracy_meters: data.accuracyMeters || null,
      speed_kmh: data.speedKmh || null,
      heading: data.heading || null,
      recorded_at: now,
    };

    const list = fallbackLocations.get(data.incidentId) || [];
    list.push(record);
    fallbackLocations.set(data.incidentId, list);

    return record;
  }

  async findNearbyIncidents(
    latitude: number,
    longitude: number,
    radiusKm = 0.5,
    windowMinutes = 30
  ): Promise<IncidentRecord[]> {
    const cutoffTime = new Date(Date.now() - windowMinutes * 60 * 1000);

    if (pool && isPostgresConnected) {
      try {
        const res = await query<IncidentRecord>(
          `SELECT * FROM incidents
           WHERE reported_at >= $1
             AND status NOT IN ('resolved', 'cancelled', 'false_report', 'expired')
             AND ST_DWithin(
               location,
               ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
               $4
             )`,
          [cutoffTime, longitude, latitude, radiusKm * 1000]
        );
        return res.rows;
      } catch {
        // Fallback heuristic
      }
    }

    const latDelta = radiusKm / 111;
    const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    return Array.from(fallbackIncidents.values()).filter((i) => {
      const isRecent = new Date(i.reported_at) >= cutoffTime;
      const isActive = !['resolved', 'cancelled', 'false_report', 'expired'].includes(i.status);
      const isClose =
        Math.abs(i.latitude - latitude) <= latDelta && Math.abs(i.longitude - longitude) <= lngDelta;
      return isRecent && isActive && isClose;
    });
  }
}

export const incidentRepository = new IncidentRepository();
