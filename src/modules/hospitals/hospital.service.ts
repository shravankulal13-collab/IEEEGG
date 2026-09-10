// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Operations & Triage Service
// ============================================================

import { HospitalCapacityService } from './hospital.capacity.service';
import { HospitalResourceService } from './hospital.resource.service';
import { HospitalRepository } from './hospital.repository';

export class HospitalService {
  public capacity = new HospitalCapacityService();
  public resources = new HospitalResourceService();
  private repo = new HospitalRepository();

  public async getHospitalDashboard(hospitalId: string) {
    return this.repo.getHospitalById(hospitalId);
  }
}