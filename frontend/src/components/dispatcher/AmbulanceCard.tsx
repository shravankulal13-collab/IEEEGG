// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Ambulance Telemetry & Unit Card Component
// ============================================================

import React from 'react';
import { Ambulance, MapPin, Gauge } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface AmbulanceCardProps {
  id: string;
  unitCode: string;
  type: string;
  driver: string;
  status: 'available' | 'dispatched' | 'en_route' | 'on_scene' | 'transporting';
  speedKmH?: number;
  location?: string;
  fuel?: string;
  oxygen?: string;
  onSelect?: () => void;
  selected?: boolean;
}

export const AmbulanceCard: React.FC<AmbulanceCardProps> = ({
  unitCode,
  type,
  driver,
  status,
  speedKmH = 0,
  location = 'Sector 4, Main Highway',
  fuel = '85%',
  oxygen = '96%',
  onSelect,
  selected = false,
}) => {
  const getStatusBadge = () => {
    switch (status) {
      case 'available':
        return <Badge variant="success">AVAILABLE</Badge>;
      case 'en_route':
      case 'dispatched':
        return <Badge variant="danger">EN ROUTE</Badge>;
      case 'on_scene':
        return <Badge variant="warning">ON SCENE</Badge>;
      case 'transporting':
        return <Badge variant="info">TRANSPORTING</Badge>;
      default:
        return <Badge variant="neutral">{String(status).toUpperCase()}</Badge>;
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-2xl border transition-all cursor-pointer ${selected
          ? 'bg-blue-50/70 border-blue-500 shadow-md ring-2 ring-blue-500/20'
          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
        }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">

          </div>
          <div>
            <h4 className="text-xs font-black text-slate-900">{unitCode}</h4>
            <span className="text-[10px] text-slate-500 font-medium">{type}</span>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-1 text-[11px] text-slate-600">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-semibold">Driver:</span>
          <span className="font-bold text-slate-800">{driver}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-400 font-semibold flex items-center gap-1">
            Location:
          </span>
          <span className="truncate max-w-[140px] text-slate-700">{location}</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-slate-100 font-mono text-[10px]">
          <span>Fuel: {fuel}</span>
          <span>O2: {oxygen}</span>
          {speedKmH > 0 && (
            <span className="text-blue-600 font-bold flex items-center gap-0.5">
              {speedKmH} km/h
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmbulanceCard;
