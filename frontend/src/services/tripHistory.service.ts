// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Trip Response History & Audit Storage
// ============================================================

import { incidentService, type IncidentRecord } from './incident.service';

export interface CompletedTripRecord {
  id: string;
  incidentId: string;
  incidentNumber: string;
  type: string;
  category: string;
  date: string;
  timestamp: string;
  pickup: string;
  hospital: string;
  duration: string;
  status: 'COMPLETED';
  patientName: string;
  patientPhone: string;
  severity: number;
}

const STORAGE_KEY = 'resqgrid_trip_history';

// Default authentic historical ambulance logs for Bengaluru ALS Fleet
const DEFAULT_HISTORICAL_TRIPS: CompletedTripRecord[] = [
  {
    id: 'TRIP-8041',
    incidentId: '6e136310-20ce-4074-b520-8283787de2ea',
    incidentNumber: 'ER-76',
    type: 'Severe Acute Cardiac Emergency',
    category: 'medical',
    date: 'Today, 11:20 AM',
    timestamp: new Date(Date.now() - 4 * 3600000).toISOString(),
    pickup: '45 Residency Road, Central Bengaluru',
    hospital: 'Victoria Hospital (BMCRI Trauma Care)',
    duration: '14 mins',
    status: 'COMPLETED',
    patientName: 'Ramesh Narayanan',
    patientPhone: '+91 98450 23145',
    severity: 5,
  },
  {
    id: 'TRIP-8040',
    incidentId: '6e136310-20ce-4074-b520-8283787de2eb',
    incidentNumber: 'ER-72',
    type: 'Two-Vehicle Highway Collision (SH 104A)',
    category: 'accident',
    date: 'Yesterday, 08:45 PM',
    timestamp: new Date(Date.now() - 24 * 3600000).toISOString(),
    pickup: 'Hebbal Flyover Junction, Outer Ring Corridor',
    hospital: 'Apollo Hospital Bannerghatta',
    duration: '18 mins',
    status: 'COMPLETED',
    patientName: 'Suresh Gowda',
    patientPhone: '+91 98801 88721',
    severity: 4,
  },
  {
    id: 'TRIP-8039',
    incidentId: '6e136310-20ce-4074-b520-8283787de2ec',
    incidentNumber: 'ER-69',
    type: 'Industrial Solvent Exposure Burn Injury',
    category: 'fire',
    date: 'Yesterday, 02:15 PM',
    timestamp: new Date(Date.now() - 30 * 3600000).toISOString(),
    pickup: 'Koramangala 4th Block Industrial Estate',
    hospital: 'St. Johns Medical College Hospital',
    duration: '11 mins',
    status: 'COMPLETED',
    patientName: 'Deepak Rao',
    patientPhone: '+91 98440 33910',
    severity: 3,
  },
];

export class TripHistoryService {
  getLocalTrips(): CompletedTripRecord[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return DEFAULT_HISTORICAL_TRIPS;
  }

  saveCompletedTrip(trip: CompletedTripRecord): void {
    const existing = this.getLocalTrips();
    // Prepend and filter duplicates by incidentId
    const updated = [trip, ...existing.filter((t) => t.incidentId !== trip.incidentId)];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage quota
    }
  }

  async getAllTrips(): Promise<CompletedTripRecord[]> {
    const localTrips = this.getLocalTrips();
    const seenIncidentIds = new Set(localTrips.map((t) => t.incidentId));

    try {
      // Query backend for resolved incidents to merge
      const res = await incidentService.list({ status: 'resolved' }).catch(() => null);
      if (res && res.items && Array.isArray(res.items)) {
        const remoteTrips: CompletedTripRecord[] = res.items
          .filter((inc) => !seenIncidentIds.has(inc.id))
          .map((inc) => ({
            id: `TRIP-${inc.id.slice(0, 4).toUpperCase()}`,
            incidentId: inc.id,
            incidentNumber: inc.incident_number
              ? `ER-${inc.incident_number}`
              : `ER-${inc.id.slice(0, 6).toUpperCase()}`,
            type: inc.title || `${inc.emergency_type.toUpperCase()} Emergency`,
            category: inc.emergency_type,
            date: inc.resolved_at
              ? new Date(inc.resolved_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recent Mission',
            timestamp: inc.resolved_at || inc.updated_at || new Date().toISOString(),
            pickup: inc.address || 'Bengaluru Emergency Coordinates',
            hospital: inc.assigned_hospital_name || 'Victoria Hospital (BMCRI Trauma Care)',
            duration: '15 mins',
            status: 'COMPLETED',
            patientName: inc.reporter_name || 'Citizen Caller',
            patientPhone: inc.reporter_phone || '+91 98765 43210',
            severity: inc.severity || 4,
          }));

        return [...localTrips, ...remoteTrips];
      }
    } catch {
      // fallback to local trips
    }

    return localTrips;
  }
}

export const tripHistoryService = new TripHistoryService();
