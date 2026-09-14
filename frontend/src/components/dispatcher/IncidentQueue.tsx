// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Incident Queue List Component
// ============================================================

import React from 'react';
import { IncidentCard, type IncidentCardProps } from './IncidentCard';

export interface IncidentQueueProps {
  incidents: IncidentCardProps[];
  selectedId?: string;
  onSelectIncident?: (id: string) => void;
  className?: string;
}

export const IncidentQueue: React.FC<IncidentQueueProps> = ({
  incidents,
  selectedId,
  onSelectIncident,
  className = '',
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {incidents.map((inc) => (
        <IncidentCard
          key={inc.id}
          {...inc}
          selected={inc.id === selectedId}
          onSelect={() => onSelectIncident?.(inc.id)}
        />
      ))}
      {incidents.length === 0 && (
        <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
          No active emergency incidents currently queued.
        </div>
      )}
    </div>
  );
};

export default IncidentQueue;
