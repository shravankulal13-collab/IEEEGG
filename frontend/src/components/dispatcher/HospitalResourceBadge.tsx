// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Resource Badge Component
// ============================================================

import React from 'react';
import { Badge } from '../ui/Badge';

export interface HospitalResourceBadgeProps {
  icuBeds: number;
  className?: string;
}

export const HospitalResourceBadge: React.FC<HospitalResourceBadgeProps> = ({
  icuBeds,
  className = '',
}) => {
  if (icuBeds >= 5) {
    return <Badge variant="success" className={className}>{icuBeds} ICU BEDS FREE</Badge>;
  }
  if (icuBeds > 0) {
    return <Badge variant="warning" className={className}>{icuBeds} ICU BEDS LOW</Badge>;
  }
  return <Badge variant="danger" className={className}>ICU FULL</Badge>;
};

export default HospitalResourceBadge;
