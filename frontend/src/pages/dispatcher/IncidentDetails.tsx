// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Incident Operational Detail & Dispatch Timeline View
// ============================================================

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Clock,
  AlertOctagon,
  ShieldCheck,
  Users,
  Activity,
  FileText,
  Calendar,
} from 'lucide-react';
import {
  incidentService,
  type IncidentRecord,
} from '../../services/incident.service';
import { getSeverityDetails } from '../../components/maps/IncidentMarker';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';

export const IncidentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const fetchIncident = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await incidentService.getById(id);
        setIncident(data);
      } catch (err: any) {
        setError(err?.message || 'Failed to retrieve incident telemetry');
      } finally {
        setLoading(false);
      }
    };
    fetchIncident();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-4">
        <Skeleton width={120} height={32} />
        <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4">
          <Skeleton width="40%" height={28} />
          <Skeleton width="60%" height={16} />
          <div className="grid grid-cols-3 gap-4 pt-4">
            <Skeleton height={80} />
            <Skeleton height={80} />
            <Skeleton height={80} />
          </div>
        </div>
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="max-w-xl mx-auto mt-12">
        <ErrorState
          title="Incident Not Found"
          message={error || 'Could not locate the requested incident dossier.'}
          onRetry={() => navigate('/dispatcher')}
        />
      </div>
    );
  }

  const { label: severityLabel, bgColor, textColor, borderColor, isCritical } =
    getSeverityDetails(incident.severity);

  // Custom marker icon
  const markerIcon = L.divIcon({
    html: `
      <div class="w-8 h-8 rounded-full bg-[#FF1F2D] text-white flex items-center justify-center font-bold text-xs shadow-[0_0_12px_#ef4444] border-2 border-white">
        !
      </div>
    `,
    className: 'ops-detail-pin',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-12">
      {/* Back navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-[#07133A] border border-blue-900/40 hover:bg-[#0B1B4A] hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Operations</span>
        </button>

        <div className="flex items-center gap-2">
          <Link
            to="/dispatcher"
            className="text-xs font-semibold text-cyan-400 hover:underline"
          >
            Open in Command Map →
          </Link>
        </div>
      </div>

      {/* Main Dossier Card */}
      <div className="rounded-2xl bg-[#07133A]/90 border border-blue-900/30 shadow-xl p-6 space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-blue-900/30">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <span className="font-mono text-sm font-bold text-cyan-400 px-2 py-0.5 rounded bg-[#050B24] border border-blue-900/40">
                #{incident.incident_number || incident.id.slice(0, 8)}
              </span>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-xs"
                style={{ backgroundColor: bgColor, color: textColor, borderColor }}
              >
                {isCritical && <AlertOctagon className="w-3 h-3 animate-pulse text-[#FF1F2D]" />}
                {severityLabel} PRIORITY
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-950 text-cyan-400 border border-blue-800">
                {incident.status}
              </span>
            </div>
            <h2 className="text-xl font-bold text-white capitalize font-display">
              {incident.title || `${incident.emergency_type} Emergency Incident`}
            </h2>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>
                Reported:{' '}
                <strong className="text-slate-200">
                  {new Date(incident.reported_at || incident.created_at).toLocaleString()}
                </strong>
              </span>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#050B24]/80 border border-blue-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Emergency Nature
            </span>
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-bold text-white capitalize">
                {incident.emergency_type}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#050B24]/80 border border-blue-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Verification State
            </span>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-bold text-white capitalize">
                {incident.verification_status || 'Verified'}
              </span>
              {incident.verification_score != null && (
                <span className="text-xs text-cyan-400 font-mono">
                  ({Math.round(incident.verification_score * 100)}%)
                </span>
              )}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#050B24]/80 border border-blue-900/40">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
              Casualties / Affected
            </span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-white">
                {incident.people_affected != null ? `${incident.people_affected} Reported` : 'Unspecified'}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Tactical Mini-Map */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Left: Location & Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Incident Location
              </h4>
              <p className="text-sm font-semibold text-white">
                {incident.address || 'Address not resolved'}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {incident.city && `${incident.city}, `}
                {incident.state && `${incident.state}, `}
                {incident.country || 'India'}
              </p>
              <p className="text-xs font-mono text-cyan-400 mt-1">
                Coordinates: {incident.latitude.toFixed(5)}, {incident.longitude.toFixed(5)}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" /> Operational Narrative
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-[#050B24]/80 p-3.5 rounded-xl border border-blue-900/40">
                {incident.description || 'No descriptive statement provided at time of report.'}
              </p>
            </div>
          </div>

          {/* Right: Mini Map with Carto Dark Tiles */}
          <div className="h-64 rounded-xl overflow-hidden border border-blue-900/40 shadow-inner">
            <MapContainer
              center={[incident.latitude, incident.longitude]}
              zoom={14}
              zoomControl={false}
              className="w-full h-full"
            >
              <TileLayer
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              <Marker
                position={[incident.latitude, incident.longitude]}
                icon={markerIcon}
              />
            </MapContainer>
          </div>
        </div>

        {/* Lifecycle Milestones Timeline */}
        <div className="pt-4 border-t border-blue-900/30">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Operational Milestones
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-[#050B24]/80 border border-blue-900/40">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">1. Reported</span>
              <span className="font-semibold text-slate-200">
                {new Date(incident.reported_at || incident.created_at).toLocaleTimeString()}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#050B24]/80 border border-blue-900/40">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">2. Verified</span>
              <span className="font-semibold text-slate-200">
                {incident.verified_at ? new Date(incident.verified_at).toLocaleTimeString() : 'Automatic / Instant'}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#050B24]/80 border border-blue-900/40">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">3. Dispatch Status</span>
              <span className="font-semibold text-slate-200 capitalize">
                {incident.status}
              </span>
            </div>

            <div className="p-3 rounded-lg bg-[#050B24]/80 border border-blue-900/40">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">4. Resolved</span>
              <span className="font-semibold text-slate-200">
                {incident.resolved_at ? new Date(incident.resolved_at).toLocaleTimeString() : 'In Progress'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
