// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Traffic & Routing Optimization Lead
// MODULE: Realtime Traffic Bottleneck Alert Component
// ============================================================

import React from 'react';
import { AlertTriangle, MapPin } from 'lucide-react';

export interface TrafficAlertProps {
  id: string;
  type: string;
  location: string;
  delayMinutes: number;
  status?: string;
  onReroute?: () => void;
  className?: string;
}

export const TrafficAlert: React.FC<TrafficAlertProps> = ({
  type,
  location,
  delayMinutes,
  status = 'DETOUR ACTIVE',
  className = '',
}) => {
  return (
    <div className={`p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start justify-between gap-3 ${className}`}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0 mt-0.5">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-900">{type}</h4>
          <p className="text-[11px] text-slate-600 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span>{location}</span>
          </p>
          <span className="text-[10px] font-bold text-red-600 mt-1 block">
            +{delayMinutes} mins delay on direct path
          </span>
        </div>
      </div>

      <span className="px-2.5 py-1 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold uppercase shrink-0">
        {status}
      </span>
    </div>
  );
};

export default TrafficAlert;
