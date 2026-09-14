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

  public async getAllHospitals() {
    return this.repo.getAllHospitals();
  }

  public async getHospitalById(hospitalId: string) {
    return this.repo.getHospitalById(hospitalId);
  }

  public async getHospitalDashboard(hospitalId: string) {
    const hospital = await this.repo.getHospitalById(hospitalId);
    if (!hospital) return null;

    const [rawDoctors, rawResources] = await Promise.all([
      this.repo.getDoctors(hospitalId),
      this.repo.getResources(hospitalId),
    ]);

    const totalBeds = Number(hospital.total_beds || 300);
    const availBeds = Number(hospital.available_beds ?? hospital.availableEmergencyBeds ?? 45);
    const totalIcu = Number(hospital.total_icu_beds || 30);
    const availIcu = Number(hospital.available_icu_beds ?? hospital.availableICUBeds ?? 8);

    const occupancyRate = Math.max(0, Math.min(100, Math.round(((totalBeds - availBeds) / Math.max(1, totalBeds)) * 100)));
    const icuOccupancyRate = Math.max(0, Math.min(100, Math.round(((totalIcu - availIcu) / Math.max(1, totalIcu)) * 100)));

    const doctors = rawDoctors.map((d: any) => ({
      id: d.id,
      name: d.name,
      specialty: d.specialization || d.specialty || 'Trauma & Critical Care',
      department: d.department || 'Emergency Medicine',
      phone: d.phone || '+919800000000',
      status: d.available ? (d.on_duty ? 'AVAILABLE' : 'OFF_DUTY') : 'SURGERY',
      shift_end: 'Active Emergency Shift',
    }));

    return {
      hospital,
      doctors,
      resources: rawResources,
      incoming_patients: [],
      occupancy_rate: occupancyRate,
      icu_occupancy_rate: icuOccupancyRate,
      ventilator_occupancy_rate: Math.min(90, Math.max(20, icuOccupancyRate - 5)),
      recent_admissions_count: Math.max(1, Math.floor(totalBeds * 0.05)),
    };
  }

  public async getDoctors(hospitalId: string) {
    return this.repo.getDoctors(hospitalId);
  }

  public async getAllDoctors() {
    return this.repo.getAllDoctors();
  }

  public async createDoctor(data: {
    hospitalId: string;
    name: string;
    specialization: string;
    department?: string;
    phone?: string;
    available?: boolean;
    onDuty?: boolean;
  }) {
    return this.repo.createDoctor(data);
  }

  public async updateDoctor(doctorId: string, updates: Partial<{
    name: string;
    specialization: string;
    department: string;
    phone: string;
    available: boolean;
    on_duty: boolean;
  }>) {
    return this.repo.updateDoctor(doctorId, updates);
  }

  public async deleteDoctor(doctorId: string) {
    return this.repo.deleteDoctor(doctorId);
  }

  public async getResources(hospitalId: string) {
    return this.repo.getResources(hospitalId);
  }

  public async updateResource(resourceId: string, availableQuantity: number, totalQuantity?: number) {
    return this.repo.updateResource(resourceId, availableQuantity, totalQuantity);
  }

  public async updateHospitalMetrics(hospitalId: string, data: {
    available_beds?: number;
    total_beds?: number;
    available_icu_beds?: number;
    total_icu_beds?: number;
    available_doctors?: number;
    total_doctors?: number;
  }) {
    return this.repo.updateHospitalMetrics(hospitalId, data);
  }
}