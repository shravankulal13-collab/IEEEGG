// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Master Live Emergency Map Canvas (React Leaflet)
// ============================================================

import React, { useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import { IncidentMarker } from './IncidentMarker';
import { AmbulanceMarker } from './AmbulanceMarker';
import { HospitalMarker, type HospitalLocation } from './HospitalMarker';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { useMapStore } from '../../store/mapStore';
import type { IncidentRecord } from '../../services/incident.service';
import type { AmbulanceData } from '../../services/ambulance.service';

interface EmergencyMapProps {
  incidents: IncidentRecord[];
  ambulances: AmbulanceData[];
  hospitals?: HospitalLocation[];
  onSelectIncident?: (incident: IncidentRecord) => void;
  onSelectAmbulance?: (ambulance: AmbulanceData) => void;
  className?: string;
}

// Controller component to handle panning, zooming, and bound fitting
function MapController({
  incidents,
  ambulances,
  hospitals = [],
  selectedIncident,
  selectedAmbulance,
}: {
  incidents: IncidentRecord[];
  ambulances: AmbulanceData[];
  hospitals: HospitalLocation[];
  selectedIncident?: IncidentRecord | null;
  selectedAmbulance?: AmbulanceData | null;
}) {
  const map = useMap();
  const { fitTrigger, fitTarget } = useMapStore();
  const initialFitDone = useRef(false);

  // Pan smoothly to selected incident
  useEffect(() => {
    if (selectedIncident?.latitude && selectedIncident?.longitude) {
      map.flyTo([selectedIncident.latitude, selectedIncident.longitude], 15, {
        duration: 0.8,
      });
    }
  }, [selectedIncident, map]);

  // Pan smoothly to selected ambulance
  useEffect(() => {
    if (selectedAmbulance?.current_latitude && selectedAmbulance?.current_longitude) {
      map.flyTo(
        [selectedAmbulance.current_latitude, selectedAmbulance.current_longitude],
        15,
        { duration: 0.8 }
      );
    }
  }, [selectedAmbulance, map]);

  // Handle bounds fitting
  useEffect(() => {
    if (fitTrigger === 0 && initialFitDone.current) return;

    const points: [number, number][] = [];

    if (fitTarget === 'all' || fitTarget === 'incidents' || !initialFitDone.current) {
      incidents.forEach((i) => {
        if (i.latitude && i.longitude) points.push([i.latitude, i.longitude]);
      });
    }

    if (fitTarget === 'all' || fitTarget === 'ambulances' || !initialFitDone.current) {
      ambulances.forEach((a) => {
        if (a.current_latitude && a.current_longitude) {
          points.push([a.current_latitude, a.current_longitude]);
        }
      });
    }

    if (fitTarget === 'all') {
      hospitals.forEach((h) => {
        if (h.latitude && h.longitude) points.push([h.latitude, h.longitude]);
      });
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      initialFitDone.current = true;
    }
  }, [fitTrigger, fitTarget, incidents, ambulances, hospitals, map]);

  return null;
}

// Sample fallback hospitals if none provided
const DEFAULT_HOSPITALS: HospitalLocation[] = [
  {
    id: 'hosp-1',
    name: 'Apollo Emergency Trauma Center',
    latitude: 12.9344,
    longitude: 77.6111,
    traumaLevel: 'Level 1 Trauma',
    availableBeds: 12,
  },
  {
    id: 'hosp-2',
    name: 'Manipal Central Emergency Wing',
    latitude: 12.9592,
    longitude: 77.6444,
    traumaLevel: 'Level 1 Trauma',
    availableBeds: 8,
  },
  {
    id: 'hosp-3',
    name: 'Fortis Multi-Specialty Hospital',
    latitude: 12.8951,
    longitude: 77.5985,
    traumaLevel: 'Level 2 Trauma',
    availableBeds: 15,
  },
];

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  incidents,
  ambulances,
  hospitals = DEFAULT_HOSPITALS,
  onSelectIncident,
  onSelectAmbulance,
  className = '',
}) => {
  const {
    center,
    zoom,
    showIncidents,
    showAmbulances,
    showHospitals,
    selectedIncidentId,
    selectedAmbulanceId,
    setSelectedIncidentId,
    setSelectedAmbulanceId,
  } = useMapStore();

  const selectedIncident = useMemo(
    () => incidents.find((i) => i.id === selectedIncidentId) || null,
    [incidents, selectedIncidentId]
  );

  const selectedAmbulance = useMemo(
    () => ambulances.find((a) => a.id === selectedAmbulanceId) || null,
    [ambulances, selectedAmbulanceId]
  );

  const handleIncidentSelect = (inc: IncidentRecord) => {
    setSelectedIncidentId(inc.id);
    if (onSelectIncident) onSelectIncident(inc);
  };

  const handleAmbulanceSelect = (amb: AmbulanceData) => {
    setSelectedAmbulanceId(amb.id);
    if (onSelectAmbulance) onSelectAmbulance(amb);
  };

  return (
    <div className={`flex flex-col w-full h-full rounded-2xl overflow-hidden border border-slate-200/80 bg-white shadow-xs ${className}`}>
      {/* Map Card Header matching white operational overview */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-white select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shadow-2xs">
            <span className="text-base">🗺️</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight font-display">
              Live Operations Map
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time incidents, ambulance fleet and hospital network
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700">
            <span>Bengaluru</span>
            <span className="text-[10px] text-slate-400">▾</span>
          </div>

          <button
            type="button"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Toggle fullscreen map view"
          >
            <span className="text-xs">⛶</span>
          </button>
        </div>
      </div>

      {/* Map Canvas Area */}
      <div className="relative flex-1 w-full min-h-[420px] bg-[#050B24]">
        <MapContainer
          center={center}
          zoom={zoom}
          zoomControl={false}
          className="w-full h-full"
          style={{ minHeight: '420px', height: '100%' }}
        >
          {/* Carto Dark Matter Emergency Surface */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />

          {/* Map Controller for dynamic pan and fit */}
          <MapController
            incidents={incidents}
            ambulances={ambulances}
            hospitals={hospitals}
            selectedIncident={selectedIncident}
            selectedAmbulance={selectedAmbulance}
          />

          {/* Incident Markers */}
          {showIncidents &&
            incidents.map((incident) => (
              <IncidentMarker
                key={incident.id}
                incident={incident}
                isSelected={incident.id === selectedIncidentId}
                onSelect={handleIncidentSelect}
              />
            ))}

          {/* Ambulance Markers */}
          {showAmbulances &&
            ambulances.map((ambulance) => (
              <AmbulanceMarker
                key={ambulance.id}
                ambulance={ambulance}
                isSelected={ambulance.id === selectedAmbulanceId}
                onSelect={handleAmbulanceSelect}
              />
            ))}

          {/* Hospital Markers */}
          {showHospitals &&
            hospitals.map((hospital) => (
              <HospitalMarker key={hospital.id} hospital={hospital} />
            ))}
        </MapContainer>

        {/* Floating Operational Controls & Legend */}
        <MapControls
          onResetView={() => {
            useMapStore.getState().setViewport([12.9716, 77.5946], 12);
          }}
        />
        <MapLegend />
      </div>
    </div>
  );
};
