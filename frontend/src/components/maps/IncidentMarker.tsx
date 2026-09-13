// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Live Incident Map Marker (Leaflet DivIcon)
// ============================================================

import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { IncidentRecord } from '../../services/incident.service';

interface IncidentMarkerProps {
  incident: IncidentRecord;
  isSelected: boolean;
  onSelect: (incident: IncidentRecord) => void;
}

// Severity color map
export function getSeverityDetails(severity: number | null | undefined) {
  const sev = severity ?? 2;
  if (sev >= 4) {
    return {
      label: 'CRITICAL',
      color: '#FF1F2D',
      bgColor: 'rgba(255, 31, 45, 0.2)',
      textColor: '#FF6B75',
      borderColor: '#FF1F2D',
      isCritical: true,
    };
  }
  if (sev === 3) {
    return {
      label: 'HIGH',
      color: '#F97316',
      bgColor: 'rgba(249, 115, 22, 0.2)',
      textColor: '#FB923C',
      borderColor: '#F97316',
      isCritical: false,
    };
  }
  if (sev === 2) {
    return {
      label: 'MEDIUM',
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.2)',
      textColor: '#FBBF24',
      borderColor: '#F59E0B',
      isCritical: false,
    };
  }
  return {
    label: 'LOW',
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.2)',
    textColor: '#60A5FA',
    borderColor: '#3B82F6',
    isCritical: false,
  };
}

export const IncidentMarker: React.FC<IncidentMarkerProps> = ({
  incident,
  isSelected,
  onSelect,
}) => {
  const { isCritical, color } = getSeverityDetails(incident.severity);

  // Memoize custom Leaflet HTML icon
  const icon = useMemo(() => {
    const beaconRing = isCritical
      ? `<span class="absolute -inset-3 rounded-full pointer-events-none ops-beacon-ring" style="background-color: ${color};"></span>`
      : '';

    const selectionHalo = isSelected
      ? `<span class="absolute -inset-3 rounded-full ring-4 ring-cyan-400 ring-offset-2 ring-offset-[#07133A] pointer-events-none transition-all shadow-[0_0_15px_#22d3ee]"></span>`
      : '';

    // Emergency type SVG icon
    const t = (incident.emergency_type || '').toLowerCase();
    let typeIcon = '';
    if (t.includes('med') || t.includes('card')) {
      typeIcon = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>`;
    } else if (t.includes('acc') || t.includes('traf')) {
      typeIcon = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`;
    } else if (t.includes('fire')) {
      typeIcon = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/></svg>`;
    } else {
      typeIcon = `<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`;
    }

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer select-none transition-transform duration-180 hover:scale-110" style="width: 32px; height: 32px;">
        ${beaconRing}
        ${selectionHalo}
        <div class="w-8 h-8 rounded-full flex items-center justify-center text-white shadow-lg border-2 border-white/90"
             style="background-color: ${color};">
          ${typeIcon}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'ops-custom-incident-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }, [incident.severity, incident.emergency_type, isCritical, isSelected, color]);

  if (!incident.latitude || !incident.longitude) return null;

  return (
    <Marker
      position={[incident.latitude, incident.longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(incident),
      }}
    >
      <Popup className="ops-leaflet-popup">
        <div className="p-1 min-w-[210px] text-slate-100">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-blue-900/40">
            <span className="font-bold text-xs font-mono text-cyan-400">
              #{incident.incident_number || incident.id.slice(0, 8)}
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase border"
              style={{
                backgroundColor: getSeverityDetails(incident.severity).bgColor,
                color: getSeverityDetails(incident.severity).textColor,
                borderColor: getSeverityDetails(incident.severity).borderColor,
              }}
            >
              {getSeverityDetails(incident.severity).label}
            </span>
          </div>

          <p className="text-xs font-semibold text-white mb-1 capitalize">
            {incident.title || `${incident.emergency_type} Emergency`}
          </p>

          <p className="text-[11px] text-slate-400 mb-2 truncate">
            📍 {incident.address || `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`}
          </p>

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-blue-900/40">
            <span className="font-medium uppercase">
              Status: <strong className="text-slate-200">{incident.status}</strong>
            </span>
            <button
              type="button"
              onClick={() => onSelect(incident)}
              className="text-cyan-400 font-bold hover:underline"
            >
              Select & Inspect
            </button>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
