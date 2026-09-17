// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Ambulance Status Badge Component
// ============================================================

import React from 'react';
import { Badge } from '../ui/Badge';

export interface AmbulanceStatusBadgeProps {
  status: 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'transporting' | 'offline';
  className?: string;
}

export const AmbulanceStatusBadge: React.FC<AmbulanceStatusBadgeProps> = ({
  status,
  className = '',
}) => {
  switch (status) {
    case 'available':
      return <Badge variant="success" className={className}>AVAILABLE</Badge>;
    case 'dispatched':
    case 'en_route':
      return <Badge variant="danger" className={className}>EN ROUTE</Badge>;
    case 'on_scene':
      return <Badge variant="warning" className={className}>ON SCENE</Badge>;
    case 'transporting':
      return <Badge variant="info" className={className}>TRANSPORTING</Badge>;
    case 'offline':
      return <Badge variant="neutral" className={className}>OFFLINE</Badge>;
    default:
      return <Badge variant="neutral" className={className}>{status}</Badge>;
  }
};

export default AmbulanceStatusBadge;
