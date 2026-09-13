// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Live Incident Queue Card
// ============================================================

import React from 'react';
import {
  AlertOctagon,
  Flame,
  HeartPulse,
  Car,
  ShieldAlert,
  MapPin,
  Clock,
  ChevronRight,
} from 'lucide-react';
import type { IncidentRecord } from '../../services/incident.service';
import { getSeverityDetails } from '../maps/IncidentMarker';

interface IncidentCardProps {
  incident: IncidentRecord;
  isSelected?: boolean;
  onSelect?: (incident: IncidentRecord) => void;
  onViewDetails?: (incident: IncidentRecord) => void;
}

export const IncidentCard: React.FC<IncidentCardProps> = ({
  incident,
  isSelected = false,
  onSelect,
  onViewDetails,
}) => {
  const { label: severityLabel, isCritical, bgColor, textColor, borderColor } =
    getSeverityDetails(incident.severity);

  // Pick emergency icon
  const getEmergencyIcon = (type: string) => {
    const t = type?.toLowerCase() || '';
    if (t.includes('medical') || t.includes('cardiac')) return <HeartPulse className="w-3.5 h-3.5 text-rose-500" />;
    if (t.includes('accident') || t.includes('traffic')) return <Car className="w-3.5 h-3.5 text-amber-500" />;
    if (t.includes('fire')) return <Flame className="w-3.5 h-3.5 text-orange-500" />;
    return <ShieldAlert className="w-3.5 h-3.5 text-blue-500" />;
  };

  // Format time elapsed
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diffMs = Date.now() - new Date(dateStr).getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return 'Just now';
      if (mins < 60) return `${mins}m ago`;
      const hours = Math.floor(mins / 60);
      return `${hours}h ${mins % 60}m ago`;
    } catch {
      return 'Recent';
    }
  };

  // Format status badge color for clean white theme
  const getStatusColor = (status: string) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('reported')) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s.includes('verified')) return 'bg-sky-50 text-sky-700 border-sky-200';
    if (s.includes('dispatch')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    if (s.includes('route')) return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s.includes('arrived') || s.includes('scene')) return 'bg-purple-50 text-purple-700 border-purple-200';
    if (s.includes('resolved')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s.includes('cancelled')) return 'bg-slate-100 text-slate-600 border-slate-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  return (
    <div
      onClick={() => onSelect && onSelect(incident)}
      className={`group relative rounded-xl border p-3 select-none cursor-pointer transition-all ${
        isSelected
          ? 'bg-blue-50/80 border-[#2563EB] ring-2 ring-[#2563EB]/25 shadow-md'
          : isCritical
          ? 'bg-red-50/30 border-red-200 hover:border-red-400 hover:bg-red-50/50 shadow-xs'
          : 'bg-white border-slate-200/90 hover:border-blue-400 hover:bg-slate-50/60 shadow-xs hover:shadow-sm'
      }`}
    >
      {/* Left accent indicator for selected / critical */}
      {isSelected ? (
        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#2563EB]" />
      ) : isCritical ? (
        <div className="absolute left-0 top-2 bottom-2 w-1 rounded-r bg-[#FF1F2D]" />
      ) : null}

      {/* Header: Incident Number, Severity, Status */}
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-blue-600">
            #{incident.incident_number || incident.id.slice(0, 8)}
          </span>
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border shadow-2xs"
            style={{ backgroundColor: bgColor, color: textColor, borderColor }}
          >
            {isCritical && <AlertOctagon className="w-2.5 h-2.5 animate-pulse text-[#FF1F2D]" />}
            {severityLabel}
          </span>
        </div>

        <span
          className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(
            incident.status
          )}`}
        >
          {incident.status}
        </span>
      </div>

      {/* Body: Title & Description */}
      <div className="mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 capitalize">
          {getEmergencyIcon(incident.emergency_type)}
          <span className="truncate">
            {incident.title || `${incident.emergency_type} Emergency`}
          </span>
        </div>
        {incident.description && (
          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
            {incident.description}
          </p>
        )}
      </div>

      {/* Footer: Location & Time */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1 text-slate-600 truncate max-w-[180px]">
          <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
          <span className="truncate text-[11px]">
            {incident.address || incident.city || `${incident.latitude?.toFixed(3)}, ${incident.longitude?.toFixed(3)}`}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="flex items-center gap-1 text-slate-400 text-[10px] font-mono">
            <Clock className="w-3 h-3 text-slate-400" />
            {formatTimeAgo(incident.reported_at || incident.created_at)}
          </span>

          {onViewDetails && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(incident);
              }}
              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              title="View full incident details"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
