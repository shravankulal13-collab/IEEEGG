// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Trip State Machine
// ============================================================

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
  available: ['reserved', 'dispatched', 'en_route_to_incident', 'maintenance', 'offline'],
  reserved: ['dispatched', 'en_route_to_incident', 'available', 'offline'],
  dispatched: ['en_route_to_incident', 'on_scene', 'transporting', 'available', 'offline'],
  en_route_to_incident: ['on_scene', 'transporting', 'at_hospital', 'available', 'dispatched'],
  on_scene: ['transporting', 'at_hospital', 'available', 'returning', 'en_route_to_incident'],
  transporting: ['at_hospital', 'on_scene', 'available', 'returning'],
  at_hospital: ['returning', 'available', 'transporting', 'offline'],
  returning: ['available', 'offline'],
  maintenance: ['available', 'offline'],
  offline: ['available', 'maintenance'],
};

export function isValidStateTransition(
  currentStatus: AmbulanceBackendStatus,
  nextStatus: AmbulanceBackendStatus
): boolean {
  if (currentStatus === nextStatus) return true;
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  return allowed.includes(nextStatus);
}

export function assertValidTransition(
  currentStatus: AmbulanceBackendStatus,
  nextStatus: AmbulanceBackendStatus
): void {
  if (!isValidStateTransition(currentStatus, nextStatus)) {
    throw new Error(
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
