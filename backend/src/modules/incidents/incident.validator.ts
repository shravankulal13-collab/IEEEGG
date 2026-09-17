// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Incident Request Validation Schemas
// ============================================================

import { z } from 'zod';

export const emergencyTypeEnum = z.enum([
  'medical',
  'accident',
  'fire',
  'police',
  'natural_disaster',
  'industrial',
  'other',
]);

export const incidentStatusEnum = z.enum([
  'reported',
  'verifying',
  'verified',
  'dispatching',
  'dispatched',
  'en_route',
  'arrived',
  'transporting',
  'resolved',
  'cancelled',
  'false_report',
  'expired',
]);

export const verificationStatusEnum = z.enum([
  'pending',
  'verified',
  'suspicious',
  'rejected',
  'manual_review',
]);

export const createIncidentSchema = z.object({
  emergencyType: emergencyTypeEnum,
  title: z.string().max(200).optional(),
  description: z.string().max(2000).optional(),
  latitude: z.number().min(-90).max(90, 'Latitude must be between -90 and 90 degrees'),
  longitude: z.number().min(-180).max(180, 'Longitude must be between -180 and 180 degrees'),
  severity: z.number().int().min(1).max(5).optional().default(3),
  peopleAffected: z.number().int().min(0).optional().default(1),
  address: z.string().max(500).optional(),
  landmark: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  country: z.string().max(100).default('India'),
  source: z.string().default('citizen_app'),
  metadata: z.record(z.string(), z.unknown()).default({}),
});

export const updateIncidentStatusSchema = z.object({
  status: incidentStatusEnum,
  reason: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const verifyIncidentSchema = z.object({
  verificationMethod: z.string().min(2, 'Verification method is required'),
  result: verificationStatusEnum,
  confidenceScore: z.number().min(0).max(100).optional().default(100),
  evidence: z.record(z.string(), z.unknown()).default({}),
  notes: z.string().max(1000).optional(),
});

export const cancelIncidentSchema = z.object({
  cancellationReason: z.string().min(3, 'Cancellation reason is required').max(500),
});

export const recordLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracyMeters: z.number().min(0).optional(),
  speedKmh: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
});

export const listIncidentsQuerySchema = z.object({
  status: incidentStatusEnum.optional(),
  emergencyType: emergencyTypeEnum.optional(),
  verificationStatus: verificationStatusEnum.optional(),
  city: z.string().optional(),
  severity: z.coerce.number().int().min(1).max(5).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type CreateIncidentInput = z.input<typeof createIncidentSchema>;
export type UpdateIncidentStatusInput = z.input<typeof updateIncidentStatusSchema>;
export type VerifyIncidentInput = z.input<typeof verifyIncidentSchema>;
export type CancelIncidentInput = z.input<typeof cancelIncidentSchema>;
export type RecordLocationInput = z.input<typeof recordLocationSchema>;
export type ListIncidentsQuery = z.input<typeof listIncidentsQuerySchema>;
