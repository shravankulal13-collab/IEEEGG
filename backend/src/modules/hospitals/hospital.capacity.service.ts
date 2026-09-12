// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital ICU & Emergency Bed Capacity Service
// ============================================================

import { HospitalRepository } from './hospital.repository';

export class HospitalCapacityService {
  private repo = new HospitalRepository();

  public async updateBedCount(hospitalId: string, type: 'ICU' | 'EMERGENCY', count: number) {
    const field = type === 'ICU' ? 'availableICUBeds' : 'availableEmergencyBeds';
    const updatedHospital = await this.repo.updateCapacity(hospitalId, field, count);
    return updatedHospital;
  }

  public async reserveBed(hospitalId: string, type: 'ICU' | 'EMERGENCY') {
    const updatedHospital = await this.repo.decrementBedCount(hospitalId, type);
    return updatedHospital;
  }
}