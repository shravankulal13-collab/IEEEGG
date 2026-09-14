// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Hospital Trauma Unit Card Component
// ============================================================

import React from 'react';
import { Building2, MapPin, Activity } from 'lucide-react';
import { HospitalResourceBadge } from './HospitalResourceBadge';

export interface HospitalCardProps {
  id: string;
  name: string;
  tier?: string;
  address: string;
  icuBeds: number;
  otAvailable?: number;
  surgeonsOnDuty?: number;
  status?: string;
  onSelect?: () => void;
  selected?: boolean;
}

export const HospitalCard: React.FC<HospitalCardProps> = ({
  name,
  tier = 'Level 1 Trauma',
  address,
  icuBeds,
  otAvailable = 2,
  surgeonsOnDuty = 4,
  onSelect,
  selected = false,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
        selected
          ? 'bg-emerald-50/70 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900 truncate max-w-[150px]">{name}</h4>
            <span className="text-[10px] text-blue-600 font-bold">{tier}</span>
          </div>
        </div>
        <HospitalResourceBadge icuBeds={icuBeds} />
      </div>

      <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate mb-3">
        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
        <span>{address}</span>
      </p>

      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[10px]">
        <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg">
          <span className="text-slate-500">Open ORs:</span>
          <span className="font-bold text-slate-800">{otAvailable}</span>
        </div>
        <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-lg">
          <span className="text-slate-500">Specialists:</span>
          <span className="font-bold text-slate-800 flex items-center gap-0.5">
            <Activity className="w-3 h-3 text-emerald-600" /> {surgeonsOnDuty}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HospitalCard;
