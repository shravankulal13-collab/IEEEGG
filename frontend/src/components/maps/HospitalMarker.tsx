// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Hospital Trauma Center Map Marker (Leaflet DivIcon)
// ============================================================

import React, { useMemo } from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

export interface HospitalLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  traumaLevel?: string;
  availableBeds?: number;
  phone?: string;
}

interface HospitalMarkerProps {
  hospital: HospitalLocation;
}

export const HospitalMarker: React.FC<HospitalMarkerProps> = ({ hospital }) => {
  const icon = useMemo(() => {
    const html = `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform hover:scale-110" style="width: 30px; height: 30px;">
        <div class="w-7 h-7 rounded-lg bg-[#0f7f86] flex items-center justify-center text-white shadow-md border-2 border-white">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      html,
      className: 'ops-custom-hospital-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    });
  }, []);

  return (
    <Marker position={[hospital.latitude, hospital.longitude]} icon={icon}>
      <Popup className="ops-leaflet-popup">
        <div className="p-1 min-w-[190px] text-slate-100">
          <div className="flex items-center gap-1.5 mb-1 pb-1 border-b border-blue-900/40">
            <span className="w-4 h-4 rounded bg-[#0f7f86] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              +
            </span>
            <span className="font-bold text-xs text-white truncate">
              {hospital.name}
            </span>
          </div>

          <div className="text-[11px] space-y-1 text-slate-300 mb-1">
            <p className="flex justify-between">
              <span className="text-slate-400">Trauma Level:</span>
              <strong className="text-slate-100">{hospital.traumaLevel || 'Level 1'}</strong>
            </p>
            {hospital.availableBeds != null && (
              <p className="flex justify-between">
                <span className="text-slate-400">Emergency Beds:</span>
                <strong className="text-emerald-400 font-semibold">{hospital.availableBeds} available</strong>
              </p>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
