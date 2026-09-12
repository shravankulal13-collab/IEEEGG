// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Incident Types & Data Contracts
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

export type EmergencyType =
  | 'medical'
  | 'accident'
  | 'fire'
  | 'police'
  | 'natural_disaster'
  | 'industrial'
  | 'other';

export type IncidentStatus =
  | 'reported'
  | 'verifying'
  | 'verified'
  | 'dispatching'
  | 'dispatched'
  | 'en_route'
  | 'arrived'
  | 'transporting'
  | 'resolved'
  | 'cancelled'
  | 'false_report'
  | 'expired';

export type VerificationStatus =
  | 'pending'
  | 'verified'
  | 'suspicious'
  | 'rejected'
  | 'manual_review';

export interface IncidentRecord {
  id: string;
  incident_number: number;
  reported_by: string | null;
  emergency_type: EmergencyType;
  title: string | null;
  description: string | null;
  status: IncidentStatus;
  verification_status: VerificationStatus;
  verification_score: number | null;
  severity: number | null; // 1 - 5
  people_affected: number | null;
  latitude: number;
  longitude: number;
  address: string | null;
  landmark: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  reported_at: Date;
  verified_at: Date | null;
  resolved_at: Date | null;
  cancelled_at: Date | null;
  cancellation_reason: string | null;
  source: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface IncidentVerificationRecord {
  id: string;
  incident_id: string;
  verifier_user_id: string | null;
  verification_method: string;
  result: VerificationStatus;
  confidence_score: number | null;
  evidence: Record<string, unknown>;
  notes: string | null;
  verified_at: Date;
}

export interface IncidentLocationUpdateRecord {
  id: string;
  incident_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  speed_kmh: number | null;
  heading: number | null;
  recorded_at: Date;
}
