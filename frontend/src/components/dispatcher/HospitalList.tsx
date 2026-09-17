// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital List Directory Component
// ============================================================

import React from 'react';
import { HospitalCard, type HospitalCardProps } from './HospitalCard';

export interface HospitalListProps {
  hospitals: HospitalCardProps[];
  selectedId?: string;
  onSelectHospital?: (id: string) => void;
  className?: string;
}

export const HospitalList: React.FC<HospitalListProps> = ({
  hospitals,
  selectedId,
  onSelectHospital,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {hospitals.map((hosp) => (
        <HospitalCard
          key={hosp.id}
          {...hosp}
          selected={hosp.id === selectedId}
          onSelect={() => onSelectHospital?.(hosp.id)}
        />
      ))}
      {hospitals.length === 0 && (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          No medical centers currently registered.
        </div>
      )}
    </div>
  );
};

export default HospitalList;
