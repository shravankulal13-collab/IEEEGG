// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Ambulance List Directory Component
// ============================================================

import React from 'react';
import { AmbulanceCard, type AmbulanceCardProps } from './AmbulanceCard';

export interface AmbulanceListProps {
  ambulances: AmbulanceCardProps[];
  selectedId?: string;
  onSelectAmbulance?: (id: string) => void;
  className?: string;
}

export const AmbulanceList: React.FC<AmbulanceListProps> = ({
  ambulances,
  selectedId,
  onSelectAmbulance,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {ambulances.map((amb) => (
        <AmbulanceCard
          key={amb.id}
          {...amb}
          selected={amb.id === selectedId}
          onSelect={() => onSelectAmbulance?.(amb.id)}
        />
      ))}
      {ambulances.length === 0 && (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          No ambulances available in this sector.
        </div>
      )}
    </div>
  );
};

export default AmbulanceList;
