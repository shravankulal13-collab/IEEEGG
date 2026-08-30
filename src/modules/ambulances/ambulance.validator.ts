// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Data Validation Schemas
// ============================================================

import { z } from 'zod';

export const ambulanceStatusEnum = z.enum([
  'available',
  'reserved',
  'dispatched',
  'en_route_to_incident',
  'on_scene',
  'transporting',
  'at_hospital',
  'returning',
  'maintenance',
  'offline',
]);

export const updateAmbulanceStatusSchema = z.object({
  status: ambulanceStatusEnum,
  incident_id: z.string().uuid().optional().nullable(),
  hospital_id: z.string().uuid().optional().nullable(),
});

export const updateAmbulanceLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed_kmh: z.number().min(0).max(300).optional(),
  heading: z.number().min(0).max(360).optional(),
  accuracy_meters: z.number().min(0).max(1000).optional(),
});

export const createAmbulanceSchema = z.object({
  ambulance_number: z.string().min(1),
  registration_number: z.string().optional(),
  organization_name: z.string().optional(),
  driver_id: z.string().uuid().optional(),
  emergency_capable: z.boolean().default(true),
  ambulance_type: z.string().optional(),
  equipment: z.record(z.string(), z.any()).optional(),
});

export type UpdateAmbulanceStatusInput = z.infer<typeof updateAmbulanceStatusSchema>;
export type UpdateAmbulanceLocationInput = z.infer<typeof updateAmbulanceLocationSchema>;
export type CreateAmbulanceInput = z.infer<typeof createAmbulanceSchema>;
