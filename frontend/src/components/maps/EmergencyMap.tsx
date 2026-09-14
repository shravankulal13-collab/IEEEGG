// ============================================================
// PRIMARY OWNER: khushi.shettyyy / SK
// ROLE: Command Center + Realtime Map Visualization
// MODULE: Master Interactive Emergency Operations Map Canvas
// ============================================================

import React, { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import { AmbulanceMarker, type AmbulanceMarkerProps } from './AmbulanceMarker';
import { IncidentMarker, type IncidentMarkerProps } from './IncidentMarker';
import { HospitalMarker, type HospitalMarkerProps } from './HospitalMarker';
import { RouteLayer } from './RouteLayer';
import { TrafficLayer } from './TrafficLayer';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { computeLiveRoute, type MapRouteResult } from '../../services/mapmyindia.service';

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
  center: _center = { lat: 12.9716, lng: 77.5946 }, // Default Bangalore Metro
  incidents = [
    { id: 'inc-1', incidentNumber: 'ER-2048', type: 'home', severity: 'critical', lat: 12.9850, lng: 77.5850, address: 'Residence, Sector 4' }
  ],
  ambulances = [
    { id: 'amb-1', unitCode: 'AMB-104', type: 'ALS', status: 'en_route', speedKmH: 64, heading: 45, lat: 12.9720, lng: 77.5950 }
  ],
  hospitals = [
    { id: 'hosp-1', name: 'Metro Trauma Facility', traumaLevel: 'Level 1', icuBedsAvailable: 4, lat: 12.9650, lng: 77.6150 }
  ],
  showGreenCorridor = true,
  activeRoute: initialRoute = null,
  className = '',
  onMarkerClick,
}) => {
  const [zoomLevel, setZoomLevel] = useState(14);
  const [activeLayer, setActiveLayer] = useState<'standard' | 'dark' | 'satellite'>('standard');
  const [calculatedRoute, setCalculatedRoute] = useState<MapRouteResult | null>(initialRoute);
  const [vehicleProgress, setVehicleProgress] = useState(0.42); // 42% along route

  // Load MapMyIndia / OSRM live route if incident & destination exist
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
      ).then(route => {
        setCalculatedRoute(route);
      });
    }
  }, [initialRoute, incidents, hospitals]);

  // Live vehicle movement simulation along the route
  useEffect(() => {
    const interval = setInterval(() => {
      setVehicleProgress(prev => (prev >= 0.95 ? 0.05 : prev + 0.012));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(18, prev + 1));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(10, prev - 1));
  const handleRecenter = () => setZoomLevel(14);
  const handleToggleLayer = () => {
    setActiveLayer(prev => (prev === 'standard' ? 'dark' : prev === 'dark' ? 'satellite' : 'standard'));
  };

  // Compute bounding box / relative positions for SVG rendering
  const minLat = 12.9550;
  const maxLat = 12.9950;
  const minLng = 77.5750;
  const maxLng = 77.6250;

  const toPercent = (lat?: number, lng?: number) => {
    const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 12.9716;
    const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : 77.5946;
    const y = ((maxLat - safeLat) / (maxLat - minLat)) * 100;
    const x = ((safeLng - minLng) / (maxLng - minLng)) * 100;
    const finalX = isNaN(x) ? 50 : Math.max(6, Math.min(94, x));
    const finalY = isNaN(y) ? 50 : Math.max(6, Math.min(94, y));
    return { x: finalX, y: finalY };
  };

  const toSvgCoord = (lat?: number, lng?: number) => {
    const safeLat = typeof lat === 'number' && !isNaN(lat) ? lat : 12.9716;
    const safeLng = typeof lng === 'number' && !isNaN(lng) ? lng : 77.5946;
    const y = ((maxLat - safeLat) / (maxLat - minLat)) * 600;
    const x = ((safeLng - minLng) / (maxLng - minLng)) * 1000;
    const finalX = isNaN(x) ? 500 : Math.max(30, Math.min(970, Math.round(x)));
    const finalY = isNaN(y) ? 300 : Math.max(30, Math.min(570, Math.round(y)));
    return { x: finalX, y: finalY };
  };

  // Primary origin & destination coords for route drawing
  const originCoord = incidents && incidents[0] ? toSvgCoord(incidents[0].lat, incidents[0].lng) : { x: 180, y: 120 };
  const destCoord = hospitals && hospitals[0] ? toSvgCoord(hospitals[0].lat, hospitals[0].lng) : { x: 820, y: 500 };

  // Calculate curved blue dashed arc control points
  const midX = (originCoord.x + destCoord.x) / 2 + (destCoord.y - originCoord.y) * 0.25;
  const midY = (originCoord.y + destCoord.y) / 2 - (destCoord.x - originCoord.x) * 0.22;
  const curvedPathD = `M ${originCoord.x} ${originCoord.y} Q ${midX} ${midY} ${destCoord.x} ${destCoord.y}`;

  const polylineSvgPoints = calculatedRoute?.polyline && Array.isArray(calculatedRoute.polyline) && calculatedRoute.polyline.length > 2
    ? calculatedRoute.polyline
        .filter((coord) => Array.isArray(coord) && coord.length >= 2 && !isNaN(coord[0]) && !isNaN(coord[1]))
        .map(([lat, lng]) => {
          const p = toSvgCoord(lat, lng);
          return `${p.x},${p.y}`;
        })
        .join(' ')
    : '';

  return (
    <div className={`relative w-full h-full min-h-[460px] rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-200/80 dark:border-[#0B1B4F]/80 select-none ${className}`}>
      
      {/* Background Interactive Map Canvas */}
      <div className={`absolute inset-0 transition-colors duration-500 ${
        activeLayer === 'standard'
          ? 'bg-[#F2F4F7]'
          : activeLayer === 'dark'
          ? 'bg-gradient-to-br from-[#060D1E] via-[#0A192F] to-[#040A17]'
          : 'bg-[#1E293B]'
      }`}>
        {/* SVG Vector Map Rendering (Matching User Reference Image) */}
        <svg viewBox="0 0 1000 600" preserveAspectRatio="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            {/* Standard Light Mode Road Shading */}
            <filter id="roadShadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#94A3B8" floodOpacity="0.25" />
            </filter>
            {/* Electric Blue Glow for Live Corridor */}
            <filter id="blueGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#0080FF" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* 1. Base Map Landmass Parcels */}
          {activeLayer === 'standard' && (
            <g className="opacity-90">
              {/* Soft terrain zones */}
              <path d="M 0 0 L 400 0 L 320 300 L 0 250 Z" fill="#EAEFF5" />
              <path d="M 600 0 L 1000 0 L 1000 400 L 700 280 Z" fill="#E8EEF5" />
              <path d="M 0 450 L 500 400 L 400 600 L 0 600 Z" fill="#ECF1F6" />
              <path d="M 550 480 L 1000 350 L 1000 600 L 500 600 Z" fill="#EAEFF4" />
            </g>
          )}

          {/* 2. Vector Roadways Network */}
          <g filter={activeLayer === 'standard' ? 'url(#roadShadow)' : undefined}>
            {/* Minor Arterial Roadway Lines */}
            <path
              d="M 60 580 Q 200 450 350 320 T 700 180 T 950 40"
              fill="none"
              stroke={activeLayer === 'standard' ? '#FFFFFF' : '#1E3A8A'}
              strokeWidth={activeLayer === 'standard' ? 14 : 8}
              strokeLinecap="round"
            />
            <path
              d="M 180 20 Q 280 250 420 400 T 820 540"
              fill="none"
              stroke={activeLayer === 'standard' ? '#FFFFFF' : '#1E3A8A'}
              strokeWidth={activeLayer === 'standard' ? 16 : 9}
              strokeLinecap="round"
            />
            <path
              d="M 650 30 Q 660 220 680 380 T 720 580"
              fill="none"
              stroke={activeLayer === 'standard' ? '#FFFFFF' : '#1E3A8A'}
              strokeWidth={activeLayer === 'standard' ? 12 : 6}
              strokeLinecap="round"
            />
            <path
              d="M 680 340 Q 820 340 850 420 T 670 470"
              fill="none"
              stroke={activeLayer === 'standard' ? '#FFFFFF' : '#1E3A8A'}
              strokeWidth={activeLayer === 'standard' ? 8 : 4}
              strokeLinecap="round"
            />
          </g>

          {/* 3. Roadway Casing Outlines for Crisp Geometry */}
          {activeLayer === 'standard' && (
            <g className="opacity-40">
              <path d="M 180 20 Q 280 250 420 400 T 820 540" fill="none" stroke="#CBD5E1" strokeWidth="18" />
              <path d="M 60 580 Q 200 450 350 320 T 700 180 T 950 40" fill="none" stroke="#CBD5E1" strokeWidth="16" />
              <path d="M 650 30 Q 660 220 680 380 T 720 580" fill="none" stroke="#CBD5E1" strokeWidth="14" />
            </g>
          )}

          {/* 4. State Highway Badges / Road Shields (Matching User Reference Image) */}
          <g className="select-none font-sans font-black text-center">
            {/* Shield 1: SH 104A Top Left */}
            <g transform="translate(240, 130)">
              <rect x="-24" y="-16" width="48" height="32" rx="7" fill="#A7C7B7" stroke="#2D4A3E" strokeWidth="1.5" />
              <text x="0" y="-2" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1C382B">SH</text>
              <text x="0" y="10" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1C382B">104A</text>
            </g>

            {/* Shield 2: MD 234 Center Right */}
            <g transform="translate(650, 235)">
              <rect x="-22" y="-16" width="44" height="32" rx="4" fill="#FFFFFF" stroke="#64748B" strokeWidth="1.2" />
              <text x="0" y="-2" textAnchor="middle" fontSize="9" fontWeight="900" fill="#1E293B">MD</text>
              <text x="0" y="9" textAnchor="middle" fontSize="9" fontWeight="900" fill="#1E293B">234</text>
            </g>

            {/* Shield 3: SH 104A Bottom Right */}
            <g transform="translate(710, 545)">
              <rect x="-24" y="-16" width="48" height="32" rx="7" fill="#A7C7B7" stroke="#2D4A3E" strokeWidth="1.5" />
              <text x="0" y="-2" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1C382B">SH</text>
              <text x="0" y="10" textAnchor="middle" fontSize="10" fontWeight="900" fill="#1C382B">104A</text>
            </g>
          </g>

          {/* 5. Secondary Direct Reference Line (Straight Gray Dashed Line) */}
          <line
            x1={originCoord.x}
            y1={originCoord.y}
            x2={destCoord.x}
            y2={destCoord.y}
            stroke="#94A3B8"
            strokeWidth="2"
            strokeDasharray="8,8"
            strokeOpacity="0.8"
          />

          {/* 6. Primary Live Emergency Route Line (Electric Blue Dashed Curve) */}
          {polylineSvgPoints ? (
            <>
              {/* Blue Ambient Glow Line */}
              <polyline
                points={polylineSvgPoints}
                fill="none"
                stroke="#0080FF"
                strokeWidth="8"
                strokeOpacity="0.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Main Blue Dashed Transit Route */}
              <polyline
                points={polylineSvgPoints}
                fill="none"
                stroke="#0080FF"
                strokeWidth="4"
                strokeDasharray="10,8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          ) : (
            <>
              {/* Fallback Smooth Curved Arc (Matches Attached Reference Image) */}
              <path
                d={curvedPathD}
                fill="none"
                stroke="#0080FF"
                strokeWidth="8"
                strokeOpacity="0.2"
                strokeLinecap="round"
              />
              <path
                d={curvedPathD}
                fill="none"
                stroke="#0080FF"
                strokeWidth="4"
                strokeDasharray="12,9"
                strokeLinecap="round"
                filter="url(#blueGlow)"
              />
            </>
          )}
        </svg>
      </div>

      {/* Top Map HUD Telemetry Header */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
        {showGreenCorridor && <RouteLayer isGreenCorridor={true} preemptedSignalsCount={3} />}
      </div>

      {/* Traffic Overlay */}
      <TrafficLayer congestionLevel="moderate" averageSpeedKmH={64} activeIncidentsCount={incidents.length} />

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

      {/* Marker Placements */}
      {/* 1. Hospitals (Destination Blue Pin) */}
      {hospitals.map(hosp => {
        const pos = toPercent(hosp.lat, hosp.lng);
        return (
          <div
            key={hosp.id}
            className="absolute transform -translate-x-1/2 -translate-y-full transition-all"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <HospitalMarker {...hosp} onClick={() => onMarkerClick?.('hospital', hosp.id)} />
          </div>
        );
      })}

      {/* 2. Incidents (Origin Dark Pin) */}
      {incidents.map(inc => {
        const pos = toPercent(inc.lat, inc.lng);
        return (
          <div
            key={inc.id}
            className="absolute transform -translate-x-1/2 -translate-y-full transition-all"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <IncidentMarker {...inc} onClick={() => onMarkerClick?.('incident', inc.id)} />
          </div>
        );
      })}

      {/* 3. Live Moving Ambulances */}
      {(ambulances || []).map(amb => {
        let pos = toPercent(amb?.lat ?? 12.972, amb?.lng ?? 77.595);
        if (calculatedRoute && Array.isArray(calculatedRoute.polyline) && calculatedRoute.polyline.length > 5) {
          const idx = Math.min(
            calculatedRoute.polyline.length - 1,
            Math.floor(vehicleProgress * calculatedRoute.polyline.length)
          );
          const pt = calculatedRoute.polyline[idx];
          if (Array.isArray(pt) && pt.length >= 2) {
            pos = toPercent(pt[0], pt[1]);
          }
        } else {
          // Move along the curved reference arc
          const t = vehicleProgress;
          const originP = toPercent(incidents && incidents[0]?.lat ? incidents[0].lat : 12.985, incidents && incidents[0]?.lng ? incidents[0].lng : 77.585);
          const destP = toPercent(hospitals && hospitals[0]?.lat ? hospitals[0].lat : 12.965, hospitals && hospitals[0]?.lng ? hospitals[0].lng : 77.615);
          const curX = (1 - t) * originP.x + t * destP.x + Math.sin(t * Math.PI) * 12;
          const curY = (1 - t) * originP.y + t * destP.y - Math.sin(t * Math.PI) * 8;
          pos = { x: isNaN(curX) ? 50 : curX, y: isNaN(curY) ? 50 : curY };
        }

        return (
          <div
            key={amb.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-linear"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <AmbulanceMarker {...amb} onClick={() => onMarkerClick?.('ambulance', amb.id)} />
          </div>
        );
      })}

      {/* Live Navigation Telemetry Badge Bottom Center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
        <div className="px-4 py-1.5 rounded-full bg-slate-900/95 dark:bg-[#0B1B4F]/95 backdrop-blur-md border border-sky-400/50 shadow-xl flex items-center gap-2 text-white text-[11px] font-bold">
          <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Live Emergency Navigation Active</span>
          <span className="text-slate-400 font-mono">|</span>
          <span className="text-sky-300 font-mono">Mappls Engine</span>
          <span className="text-slate-400 font-mono">|</span>
          <span className="text-slate-300 font-mono">{zoomLevel}x</span>
        </div>
      </div>
    </div>
  );
};

export default EmergencyMap;

