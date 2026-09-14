// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Traffic & Routing Optimization Lead
// MODULE: Alternative Route Card Component
// ============================================================

import React from 'react';
import { Navigation, Clock } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface RouteAlternativeCardProps {
  id: string;
  name: string;
  durationMinutes: number;
  distanceKm: number;
  signalsCount?: number;
  isRecommended?: boolean;
  timeSavedMinutes?: number;
  onSelect?: () => void;
  selected?: boolean;
}

export const RouteAlternativeCard: React.FC<RouteAlternativeCardProps> = ({
  name,
  durationMinutes,
  distanceKm,
  signalsCount = 4,
  isRecommended = false,
  timeSavedMinutes = 0,
  onSelect,
  selected = false,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
        selected
          ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-blue-600" />
          <h4 className="text-xs font-black text-slate-900">{name}</h4>
        </div>
        {isRecommended && <Badge variant="success">FASTEST</Badge>}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-600">
        <span className="flex items-center gap-1 font-bold text-slate-900">
          <Clock className="w-3 h-3 text-slate-400" /> {durationMinutes} min ({distanceKm} km)
        </span>
        <span className="text-[10px] text-slate-500">{signalsCount} signals</span>
      </div>

      {timeSavedMinutes > 0 && (
        <p className="text-[10px] font-bold text-emerald-600 mt-1">
          Saves {timeSavedMinutes} min vs congested route
        </p>
      )}
    </div>
  );
};

export default RouteAlternativeCard;
