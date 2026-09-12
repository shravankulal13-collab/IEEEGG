// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Specialist & Equipment Matching Service
// ============================================================

import { HospitalRepository } from './hospital.repository';

export class HospitalResourceService {
  private repo = new HospitalRepository();

  public async updateDoctorRoster(hospitalId: string, specialists: string[]) {
    await this.repo.updateSpecialists(hospitalId, specialists);
    return { success: true, specialists };
  }

  public async verifyEquipmentAvailability(hospitalId: string, equipment: string) {
    const hospital = await this.repo.getHospitalById(hospitalId);
    return hospital.equipment.includes(equipment);
  }
}