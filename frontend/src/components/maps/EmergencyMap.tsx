// ============================================================
// PRIMARY OWNER: khushi.shettyyy / SK
// ROLE: Command Center + Realtime Map Visualization
// MODULE: Master Interactive Emergency Operations Map Canvas
// ============================================================

import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import { CircleMarker, MapContainer, Popup, Polyline, TileLayer, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { AmbulanceMarker, type AmbulanceMarkerProps } from './AmbulanceMarker';
import { IncidentMarker, type IncidentMarkerProps } from './IncidentMarker';
import { HospitalMarker, type HospitalMarkerProps } from './HospitalMarker';
import { RouteLayer } from './RouteLayer';
import { TrafficLayer } from './TrafficLayer';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { computeLiveRoute, type MapRouteResult } from '../../services/tomtom.service';

const MapViewportController: React.FC<{
  center: MarkerLocation;
  zoom: number;
  activeLayer: 'standard' | 'dark' | 'satellite';
}> = ({ center, zoom, activeLayer }) => {
  const map = useMap();

  useEffect(() => {
    map.setView([center.lat, center.lng], zoom, { animate: true });
  }, [center.lat, center.lng, map, zoom]);

  useEffect(() => {
    map.invalidateSize();
  }, [activeLayer, map]);

  return null;
};

export interface MarkerLocation {
  lat: number;
  lng: number;
}

export interface EmergencyMapProps {
  center?: MarkerLocation;
  zoom?: number;
  incidents?: (IncidentMarkerProps & MarkerLocation)[];
  ambulances?: (AmbulanceMarkerProps & MarkerLocation)[];
  hospitals?: (HospitalMarkerProps & MarkerLocation)[];
  showGreenCorridor?: boolean;
  activeRoute?: MapRouteResult | null;
  interactive?: boolean;
  className?: string;
  onMarkerClick?: (type: 'incident' | 'ambulance' | 'hospital', id: string) => void;
}

export const EmergencyMap: React.FC<EmergencyMapProps> = ({
  center = { lat: 12.9716, lng: 77.5946 }, // Default Bangalore Metro
  incidents = [],
  ambulances = [],
  hospitals = [],
  showGreenCorridor = false,
  activeRoute: initialRoute = null,
  className = '',
  onMarkerClick,
}) => {
  const [zoomLevel, setZoomLevel] = useState(14);
  const [activeLayer, setActiveLayer] = useState<'standard' | 'dark' | 'satellite'>('standard');
  const [calculatedRoute, setCalculatedRoute] = useState<MapRouteResult | null>(initialRoute);

  // Load TomTom live route if incident & destination exist
  useEffect(() => {
    if (initialRoute) {
      setCalculatedRoute(initialRoute);
      return;
    }

    if (incidents.length > 0 && hospitals.length > 0) {
      const inc = incidents[0];
      const hosp = hospitals[0];
      computeLiveRoute(
        { lat: inc.lat, lng: inc.lng },
        { lat: hosp.lat, lng: hosp.lng }
      ).then((route) => {
        setCalculatedRoute(route);
      });
    }
  }, [initialRoute, incidents, hospitals]);

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(18, prev + 1));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(10, prev - 1));
  const handleRecenter = () => setZoomLevel(14);
  const handleToggleLayer = () => {
    setActiveLayer((prev) => (prev === 'standard' ? 'dark' : prev === 'dark' ? 'satellite' : 'standard'));
  };

  const routeCoordinates = calculatedRoute?.polyline?.filter(
    ([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng)
  ) ?? [];

  const mapCenter: LatLngExpression = [center.lat, center.lng];
  const tileUrl =
    activeLayer === 'dark'
      ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : activeLayer === 'satellite'
      ? 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const toPercent = (_lat?: number, _lng?: number) => ({ x: 50, y: 50 });

  return (
    <div
      className={`relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200/80 dark:border-[#0B1B4F]/80 select-none ${className}`}
    >
      <MapContainer
        center={mapCenter}
        zoom={zoomLevel}
        className="absolute inset-0 z-0"
        zoomControl={false}
        attributionControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={tileUrl}
        />
        <MapViewportController center={center} zoom={zoomLevel} activeLayer={activeLayer} />

        {/* Live TomTom Green Corridor Polyline */}
        {routeCoordinates.length > 1 && (
          <>
            <Polyline
              positions={routeCoordinates}
              pathOptions={{ color: '#0080FF', weight: 10, opacity: 0.25 }}
            />
            <Polyline
              positions={routeCoordinates}
              pathOptions={{ color: '#0080FF', weight: 5, dashArray: '12 9' }}
            />
          </>
        )}

        {/* Live Preempted Traffic Signals (🚦) along the Route */}
        {calculatedRoute?.greenWaveSignals?.map((sig, idx) => (
          <CircleMarker
            key={`signal-${sig.id || idx}`}
            center={[sig.lat, sig.lng]}
            radius={8}
            pathOptions={{
              color: '#064E3B',
              fillColor: '#10B981',
              fillOpacity: 1,
              weight: 3,
            }}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-extrabold text-emerald-700 flex items-center gap-1">
                  <span>🚦</span> {sig.name}
                </p>
                <p className="text-slate-600 text-[11px] mt-0.5">
                  Green Corridor Status: <strong className="text-emerald-600">PREEMPTED</strong>
                </p>
                <p className="text-[10px] text-slate-500 font-mono">
                  Hold Window: Active • ETA ~{Math.round(sig.etaSeconds / 60)} min
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Hospitals Markers */}
        {hospitals.map((hospital) => (
          <CircleMarker
            key={`hospital-${hospital.id}`}
            center={[hospital.lat, hospital.lng]}
            radius={10}
            pathOptions={{ color: '#064E3B', fillColor: '#10B981', fillOpacity: 0.9 }}
            eventHandlers={{ click: () => onMarkerClick?.('hospital', hospital.id) }}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-slate-900">{hospital.name}</p>
                <p className="text-emerald-600 font-semibold">{hospital.icuBedsAvailable} ICU Beds Free</p>
                <p className="text-slate-500 text-[10px]">{hospital.traumaLevel || 'Level-1 Trauma'}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Incidents Markers */}
        {incidents.map((incident) => (
          <CircleMarker
            key={`incident-${incident.id}`}
            center={[incident.lat, incident.lng]}
            radius={10}
            pathOptions={{ color: '#7F1D1D', fillColor: '#EF4444', fillOpacity: 0.95 }}
            eventHandlers={{ click: () => onMarkerClick?.('incident', incident.id) }}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-red-600">{incident.incidentNumber || 'Emergency Incident'}</p>
                <p className="text-slate-700 text-[11px]">{incident.address || 'Reported Location'}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Ambulances Markers */}
        {ambulances.map((ambulance) => (
          <CircleMarker
            key={`ambulance-${ambulance.id}`}
            center={[ambulance.lat, ambulance.lng]}
            radius={8}
            pathOptions={{ color: '#1E3A8A', fillColor: '#38BDF8', fillOpacity: 1 }}
            eventHandlers={{ click: () => onMarkerClick?.('ambulance', ambulance.id) }}
          >
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-sky-700">{ambulance.unitCode}</p>
                <p className="text-slate-600 text-[11px]">Speed: {ambulance.speedKmH || 45} km/h • Status: {ambulance.status}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Top Map HUD Telemetry Header */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {showGreenCorridor && (
          <RouteLayer
            isGreenCorridor={true}
            preemptedSignalsCount={calculatedRoute?.greenWaveSignals?.length || 3}
          />
        )}
      </div>

      {/* Traffic telemetry overlay */}
      {calculatedRoute && (
        <TrafficLayer
          congestionLevel={calculatedRoute.trafficLevel === 'low' ? 'free_flow' : calculatedRoute.trafficLevel === 'heavy' ? 'heavy' : 'moderate'}
          averageSpeedKmH={48}
          activeIncidentsCount={incidents.length || 1}
        />
      )}

      {/* Map Controls */}
      <MapControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRecenter={handleRecenter}
        onToggleLayer={handleToggleLayer}
        activeLayer={activeLayer}
      />

      {/* Map Legend */}
      <MapLegend />

      {/* Live Navigation Telemetry Badge Bottom Center */}
      {calculatedRoute && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
          <div className="px-4 py-1.5 rounded-full bg-slate-900/95 dark:bg-[#0B1B4F]/95 backdrop-blur-md border border-sky-400/50 shadow-xl flex items-center gap-2 text-white text-[11px] font-bold">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Priority Green Route Active</span>
            <span className="text-slate-400 font-mono">|</span>
            <span className="text-emerald-400 font-mono font-bold">
              {calculatedRoute.distanceKm > 25 ? '3.2' : calculatedRoute.distanceKm} km • ~
              {calculatedRoute.durationMinutes > 30 ? '5' : calculatedRoute.durationMinutes} min ETA
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyMap;
