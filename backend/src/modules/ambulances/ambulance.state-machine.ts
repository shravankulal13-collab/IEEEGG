// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Trip State Machine
// ============================================================

import { ValidationError } from '../../middleware/error.middleware.js';

export type AmbulanceBackendStatus =
  | 'available'
  | 'reserved'
  | 'dispatched'
  | 'en_route_to_incident'
  | 'on_scene'
  | 'transporting'
  | 'at_hospital'
  | 'returning'
  | 'maintenance'
  | 'offline';

export type AmbulanceUIState =
  | 'AVAILABLE'
  | 'DISPATCHED'
  | 'EN_ROUTE'
  | 'ARRIVED'
  | 'COMPLETED'
  | 'OFFLINE';

const ALLOWED_TRANSITIONS: Record<AmbulanceBackendStatus, AmbulanceBackendStatus[]> = {
  available: [
    'reserved',
    'dispatched',
    'en_route_to_incident',
    'on_scene',
    'transporting',
    'at_hospital',
    'returning',
    'maintenance',
    'offline',
  ],
  reserved: [
    'dispatched',
    'en_route_to_incident',
    'on_scene',
    'transporting',
    'at_hospital',
    'returning',
    'available',
    'offline',
  ],
  dispatched: [
    'en_route_to_incident',
    'on_scene',
    'transporting',
    'at_hospital',
    'returning',
    'available',
    'offline',
  ],
  en_route_to_incident: [
    'on_scene',
    'transporting',
    'at_hospital',
    'returning',
    'available',
    'dispatched',
    'offline',
  ],
  on_scene: [
    'transporting',
    'at_hospital',
    'returning',
    'available',
    'en_route_to_incident',
    'offline',
  ],
  transporting: [
    'at_hospital',
    'on_scene',
    'returning',
    'available',
    'offline',
  ],
  at_hospital: [
    'returning',
    'available',
    'transporting',
    'on_scene',
    'offline',
  ],
  returning: [
    'available',
    'dispatched',
    'en_route_to_incident',
    'offline',
  ],
  maintenance: [
    'available',
    'offline',
  ],
  offline: [
    'available',
    'maintenance',
    'dispatched',
    'en_route_to_incident',
    'on_scene',
  ],
};

export function isValidStateTransition(
  currentStatus: AmbulanceBackendStatus,
  nextStatus: AmbulanceBackendStatus
): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) {
    return Object.keys(ALLOWED_TRANSITIONS).includes(nextStatus);
  }
  return allowed.includes(nextStatus);
}

export function assertValidTransition(
  currentStatus: AmbulanceBackendStatus,
  nextStatus: AmbulanceBackendStatus
): void {
  if (!isValidStateTransition(currentStatus, nextStatus)) {
    throw new ValidationError(
      `Invalid ambulance state transition from '${currentStatus}' to '${nextStatus}'`
    );
  }
}

export function mapBackendStatusToUIState(
  status: AmbulanceBackendStatus
): AmbulanceUIState {
  switch (status) {
    case 'available':
      return 'AVAILABLE';
    case 'reserved':
    case 'dispatched':
      return 'DISPATCHED';
    case 'en_route_to_incident':
      return 'EN_ROUTE';
    case 'on_scene':
    case 'transporting':
    case 'at_hospital':
      return 'ARRIVED';
    case 'returning':
      return 'COMPLETED';
    case 'maintenance':
    case 'offline':
      return 'OFFLINE';
    default:
      return 'AVAILABLE';
  }
}
