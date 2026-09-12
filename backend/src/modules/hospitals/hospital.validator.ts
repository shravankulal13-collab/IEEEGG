// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Resource Validation Schemas
// ============================================================

// Add this interface to the top of hospital.validator.ts
import { z } from 'zod';

export class HospitalValidator {
  private static capacitySchema = z.object({
    type: z.enum(['ICU', 'EMERGENCY']),
    count: z.number().min(0)
  });

  public static validateCapacityUpdate(data: any) {
    return this.capacitySchema.parse(data);
  }
}