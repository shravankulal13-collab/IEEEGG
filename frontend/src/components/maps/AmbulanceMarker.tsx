// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Live Ambulance Fleet Marker (Leaflet DivIcon)
// ============================================================

import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import type { AmbulanceData } from '../../services/ambulance.service';

interface AmbulanceMarkerProps {
  ambulance: AmbulanceData;
  isSelected: boolean;
  onSelect: (ambulance: AmbulanceData) => void;
}

export function getAmbulanceStatusColor(status: string) {
  const norm = status?.toLowerCase() || '';
  if (norm.includes('available')) {
    return { bg: '#10b981', ring: '#059669', label: 'AVAILABLE', text: '#34d399' };
  }
  if (norm.includes('route') || norm.includes('dispatch')) {
    return { bg: '#2563EB', ring: '#1d4ed8', label: 'EN ROUTE', text: '#60a5fa' };
  }
  if (norm.includes('scene') || norm.includes('arrived')) {
    return { bg: '#8b5cf6', ring: '#7c3aed', label: 'ON SCENE', text: '#c084fc' };
  }
  if (norm.includes('transport')) {
    return { bg: '#f59e0b', ring: '#d97706', label: 'TRANSPORTING', text: '#fbbf24' };
  }
  if (norm.includes('return')) {
    return { bg: '#06b6d4', ring: '#0891b2', label: 'RETURNING', text: '#67e8f9' };
  }
  return { bg: '#475569', ring: '#334155', label: 'OFFLINE', text: '#94a3b8' };
}

export const AmbulanceMarker: React.FC<AmbulanceMarkerProps> = ({
  ambulance,
  isSelected,
  onSelect,
}) => {
  const { bg, label } = getAmbulanceStatusColor(ambulance.status);

  const icon = useMemo(() => {
    const selectionRing = isSelected
      ? `<span class="absolute -inset-3 rounded-2xl ring-4 ring-cyan-400 ring-offset-2 ring-offset-[#07133A] pointer-events-none transition-all shadow-[0_0_15px_#22d3ee]"></span>`
      : '';

    const headingArrow =
      typeof ambulance.current_heading === 'number'
        ? `<div style="transform: rotate(${ambulance.current_heading}deg);" class="absolute -top-1.5 w-2 h-2 border-t-2 border-r-2 border-white drop-shadow-xs"></div>`
        : '';

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer select-none transition-transform duration-180 hover:scale-110" style="width: 32px; height: 32px;">
        ${selectionRing}
        <div class="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-lg border-2 border-white/90"
             style="background-color: ${bg};">
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 8h-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h.17A3 3 0 008 19a3 3 0 002.83-2h4.34A3 3 0 0018 19a3 3 0 002.83-2H21a1 1 0 001-1v-4a4 4 0 00-3-4zm-11 9a1 1 0 110-2 1 1 0 010 2zm10 0a1 1 0 110-2 1 1 0 010 2zM5 14V5h10v3h-3a1 1 0 00-.8.4L9.4 11H5v3zm12-3h3.2a2 2 0 011.8 1.4V14h-5v-3z" />
          </svg>
          ${headingArrow}
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'ops-custom-ambulance-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16],
      popupAnchor: [0, -16],
    });
  }, [ambulance.status, ambulance.current_heading, isSelected, bg]);

  if (!ambulance.current_latitude || !ambulance.current_longitude) return null;

  return (
    <Marker
      position={[ambulance.current_latitude, ambulance.current_longitude]}
      icon={icon}
      eventHandlers={{
        click: () => onSelect(ambulance),
      }}
    >
      <Popup className="ops-leaflet-popup">
        <div className="p-1 min-w-[210px] text-slate-100">
          <div className="flex items-center justify-between gap-2 mb-1.5 pb-1 border-b border-blue-900/40">
            <span className="font-bold text-xs text-white">
              🚑 {ambulance.ambulance_number}
            </span>
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase text-white shadow-xs"
              style={{ backgroundColor: bg }}
            >
              {label}
            </span>
          </div>

          <div className="space-y-1 text-xs text-slate-300 mb-2">
            <p>
              <span className="text-slate-400">Driver:</span>{' '}
              <strong className="text-slate-100">{ambulance.driver_name || 'Assigned Driver'}</strong>
            </p>
            {ambulance.current_speed_kmh != null && (
              <p>
                <span className="text-slate-400">Speed:</span>{' '}
                <strong className="text-cyan-400 font-mono">{ambulance.current_speed_kmh} km/h</strong>
              </p>
            )}
            <p className="text-[10px] text-slate-400">
              Type: {ambulance.ambulance_type || 'ALS Unit (Advanced Life Support)'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelect(ambulance)}
            className="w-full text-center py-1 text-xs font-semibold text-cyan-400 hover:bg-blue-950/60 rounded transition-colors"
          >
            Track Unit Telemetry
          </button>
        </div>
      </Popup>
    </Marker>
  );
};
