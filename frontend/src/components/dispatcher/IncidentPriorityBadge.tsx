// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Incident Priority Badge Component
// ============================================================

import React from 'react';
import { Badge } from '../ui/Badge';

export interface IncidentPriorityBadgeProps {
  severity?: 'critical' | 'high' | 'medium' | 'low' | number | string;
  className?: string;
}

export const IncidentPriorityBadge: React.FC<IncidentPriorityBadgeProps> = ({
  severity,
  className = '',
}) => {
  const normSeverity = String(severity || '').toLowerCase();
  switch (normSeverity) {
    case '5':
    case 'critical':
      return <Badge variant="danger" className={className}>CRITICAL P1</Badge>;
    case '4':
    case 'high':
      return <Badge variant="warning" className={className}>HIGH P2</Badge>;
    case '3':
    case 'medium':
    case 'moderate':
      return <Badge variant="info" className={className}>MEDIUM P3</Badge>;
    case '2':
    case '1':
    case 'low':
      return <Badge variant="neutral" className={className}>LOW P4</Badge>;
    default:
      return <Badge variant="neutral" className={className}>{String(severity || 'P3').toUpperCase()}</Badge>;
  }
};

export default IncidentPriorityBadge;
