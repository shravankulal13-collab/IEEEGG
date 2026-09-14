// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Live Operations Statistics Component
// ============================================================

import React from 'react';
import { Card } from '../ui/Card';
import { Radio, Ambulance, Building2, Clock } from 'lucide-react';

export interface LiveStatsProps {
  activeIncidents?: number;
  availableAmbulances?: number;
  freeIcuBeds?: number;
  avgResponseMinutes?: number;
  className?: string;
}

export const LiveStats: React.FC<LiveStatsProps> = ({
  activeIncidents = 3,
  availableAmbulances = 6,
  freeIcuBeds = 40,
  avgResponseMinutes = 6.8,
  className = '',
}) => {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <Card className="p-4">
        <div className="flex items-center justify-between mb-1 text-slate-500">
          <span className="text-[11px] font-bold uppercase">Active Incidents</span>
          <Radio className="w-4 h-4 text-red-600 animate-pulse" />
        </div>
        <span className="text-2xl font-black text-slate-900">{activeIncidents}</span>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-1 text-slate-500">
          <span className="text-[11px] font-bold uppercase">Fleet Available</span>
          <Ambulance className="w-4 h-4 text-blue-600" />
        </div>
        <span className="text-2xl font-black text-slate-900">{availableAmbulances} Units</span>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-1 text-slate-500">
          <span className="text-[11px] font-bold uppercase">Free ICU Beds</span>
          <Building2 className="w-4 h-4 text-emerald-600" />
        </div>
        <span className="text-2xl font-black text-slate-900">{freeIcuBeds} Beds</span>
      </Card>

      <Card className="p-4">
        <div className="flex items-center justify-between mb-1 text-slate-500">
          <span className="text-[11px] font-bold uppercase">Avg Response Time</span>
          <Clock className="w-4 h-4 text-purple-600" />
        </div>
        <span className="text-2xl font-black text-slate-900">{avgResponseMinutes} min</span>
      </Card>
    </div>
  );
};

export default LiveStats;
