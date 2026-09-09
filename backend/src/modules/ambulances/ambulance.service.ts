// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Core Business Logic Service
// ============================================================

import { ambulanceRepository, AmbulanceRecord } from './ambulance.repository';
import { assertValidTransition, AmbulanceBackendStatus, mapBackendStatusToUIState } from './ambulance.state-machine';

export class AmbulanceService {
  async getAllAmbulances(): Promise<AmbulanceRecord[]> {
    return ambulanceRepository.findAll();
  }

  async getAmbulanceById(id: string): Promise<AmbulanceRecord> {
    const ambulance = await ambulanceRepository.findById(id);
    if (!ambulance) {
      throw new Error(`Ambulance with ID '${id}' not found`);
    }
    return ambulance;
  }

  async getAmbulanceByDriver(driverId: string): Promise<AmbulanceRecord | null> {
    return ambulanceRepository.findByDriverId(driverId);
  }

  async getAmbulanceByIncident(incidentId: string): Promise<AmbulanceRecord | null> {
    return ambulanceRepository.findByIncidentId(incidentId);
  }

  async updateAmbulanceStatus(
    id: string,
    newStatus: AmbulanceBackendStatus,
    incidentId?: string | null,
    hospitalId?: string | null
  ): Promise<AmbulanceRecord> {
    const current = await this.getAmbulanceById(id);
    assertValidTransition(current.status, newStatus);
    const updated = await ambulanceRepository.updateStatus(id, newStatus, incidentId, hospitalId);
    if (!updated) {
      throw new Error(`Failed to update status for ambulance '${id}'`);
    }
    return updated;
  }

  async updateAmbulanceLocation(
    id: string,
    latitude: number,
    longitude: number,
    speed?: number,
    heading?: number,
    accuracy?: number
  ): Promise<AmbulanceRecord> {
    const updated = await ambulanceRepository.updateLocation(
      id,
      latitude,
      longitude,
      speed,
      heading,
      accuracy
    );
    if (!updated) {
      throw new Error(`Failed to update location for ambulance '${id}'`);
    }
    return updated;
  }

  async createAmbulance(data: Partial<AmbulanceRecord>): Promise<AmbulanceRecord> {
    return ambulanceRepository.create(data);
  }
}

export const ambulanceService = new AmbulanceService();
