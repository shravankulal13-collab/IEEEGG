// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Incident Card Component
// ============================================================

import React from 'react';
import { MapPin, Clock, ArrowRight } from 'lucide-react';
import { IncidentPriorityBadge } from './IncidentPriorityBadge';

export interface IncidentCardProps {
  id: string;
  incidentNumber: string;
  type: string;
  severity?: 'critical' | 'high' | 'medium' | 'low' | number | string;
  address: string;
  reportedAt?: string;
  status?: string;
  assignedAmbulance?: string;
  hospital?: string;
  onSelect?: () => void;
  selected?: boolean;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incidentNumber,
  type,
  severity,
  address,
  reportedAt = 'Just now',
  status = 'OPEN',
  assignedAmbulance,
  onSelect,
  selected = false,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
        selected
          ? 'bg-red-50/70 border-red-500 shadow-md ring-2 ring-red-500/20'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
            {incidentNumber}
          </span>
          <IncidentPriorityBadge severity={severity} />
        </div>
        <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
          <Clock className="w-3 h-3" /> {reportedAt}
        </span>
      </div>

      <h4 className="text-xs font-extrabold text-slate-900 mb-1">{type}</h4>

      <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate mb-2">
        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
        <span>{address}</span>
      </p>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px]">
        <span className="text-slate-500">
          Unit: <strong className="text-slate-800">{assignedAmbulance || 'Unassigned'}</strong>
        </span>
        <span className="font-bold text-red-600 flex items-center gap-0.5">
          {status} <ArrowRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
};

export default IncidentCard;
