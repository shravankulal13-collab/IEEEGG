// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Dispatch Request Validation
// ============================================================

import { z } from 'zod';

// --- Shared Interfaces ---
export interface Location {
  lat: number;
  lng: number;
}

export interface Ambulance {
  id: string;
  status: 'AVAILABLE' | 'DISPATCHED' | 'MAINTENANCE' | 'OFF_DUTY';
  equipment: string[];
  location?: Location;
}

export interface Hospital {
  id: string;
  name: string;
  active: boolean;
  availableICUBeds: number;
  availableEmergencyBeds: number;
  onCallSpecialists: string[];
  equipment: string[];
  location?: Location;
}

export interface EmergencyRequest {
  id?: string;
  location: Location;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresICU: boolean;
  requiredEquipment: string[];
  requiredSpecialists: string[];
  assignedAmbulanceId?: string;
  targetHospitalId?: string;
  status?: 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'REASSIGNMENT_REQUIRED' | 'CANCELLED' | 'COMPLETED';
  bed_held?: boolean;
}
// -------------------------

export class DispatchValidator {
  private static emergencySchema = z.object({
    location: z.object({ lat: z.number(), lng: z.number() }),
    severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
    requiresICU: z.boolean(),
    requiredEquipment: z.array(z.string()),
    requiredSpecialists: z.array(z.string())
  });

  public static validateEmergencyRequest(data: any) {
    return this.emergencySchema.parse(data);
  }
}