// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Incident Detailed Forensics & Triage Console
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useIncidentStore } from '../../store/incidentStore';
import { type IncidentRecord } from '../../services/incident.service';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import {
  MapPin,
  Ambulance,
  Building2,
  Phone,
  ShieldCheck,
  Compass,
} from 'lucide-react';

export const IncidentDetails: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { fetchIncidentById } = useIncidentStore();

  const [incident, setIncident] = useState<IncidentRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setError('Incident ID is required');
      return;
    }

    setIsLoading(true);
    fetchIncidentById(id)
      .then((data) => {
        setIncident(data);
        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load incident from database');
        setIsLoading(false);
      });
  }, [id, fetchIncidentById]);

  if (isLoading) {
    return (
      <AppShell sidebarVariant="top">
        < div className="py-24 flex flex-col items-center justify-center" >
          <Spinner size="lg" />
          <p className="text-xs font-bold text-slate-500 mt-3">Loading incident dossier from database...</p>
        </div >
      </AppShell >
    );
  }

  if (error || !incident) {
    return (
      <AppShell sidebarVariant="top">
        <div className="max-w-3xl mx-auto py-12">
          <ErrorState message={`Incident Error: ${error || 'Incident not found'}`} onRetry={() => navigate('/dispatcher')} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        pillTag="Tactical Incident Dossier"
        title={`Incident Dossier: ${incident.incident_number ? `ER-${incident.incident_number}` : incident.id}`}
        subtitle="Full immutable lifecycle audit, telemetry timestamps, assigned responder unit, and destination medical center."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => navigate('/dispatcher')}>
              Back to Command Matrix
            </Button>
            <Button variant="danger" onClick={() => navigate('/dispatcher/routes')}>
              View Green Corridor
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Incident Metrics & Timeline */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div>
                <span className="text-xs font-bold text-red-600 uppercase tracking-widest block">
                  {String(
                    incident.severity === 5 || String(incident.severity).toLowerCase() === 'critical'
                      ? 'CRITICAL'
                      : incident.severity === 4 || String(incident.severity).toLowerCase() === 'high'
                        ? 'HIGH'
                        : incident.severity === 3 || String(incident.severity).toLowerCase() === 'medium' || String(incident.severity).toLowerCase() === 'moderate'
                          ? 'MEDIUM'
                          : incident.severity || 'HIGH'
                  ).toUpperCase()} PRIORITY
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-0.5 capitalize">
                  {incident.emergency_type || 'Emergency'} Incident
                </h2>
              </div>
              <Badge variant="danger">{incident.status?.toUpperCase().replace('_', ' ') || 'ACTIVE'}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Reported By</span>
                <span className="font-extrabold text-slate-900">{incident.reporter_name || 'Citizen'}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Report Time</span>
                <span className="font-extrabold text-slate-900">{new Date(incident.created_at || Date.now()).toLocaleTimeString()}</span>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] font-bold text-slate-400 block uppercase">Status</span>
                <span className="font-extrabold text-blue-600 capitalize">{incident.status?.replace('_', ' ')}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-slate-700 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                <strong>Coordinates:</strong> {incident.latitude}° N, {incident.longitude}° E | {incident.address || 'GPS Coordinates'}
              </span>
            </div>
          </Card>

          {/* Timeline */}
          <Card>
            <h3 className="text-sm font-extrabold text-slate-900 mb-4">Chronological Event Timeline</h3>
            <div className="space-y-4 relative pl-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 text-xs">
              <div className="relative">
                <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">
                  1
                </div>
                <span className="font-bold text-slate-900">SOS Signal Received</span>
                <p className="text-slate-500">Auto-captured PostGIS coordinates & citizen emergency intake logged in database.</p>
              </div>

              {incident.assigned_ambulance_id && (
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-black">
                    2
                  </div>
                  <span className="font-bold text-slate-900">Assigned Responder Unit</span>
                  <p className="text-slate-500">Assigned {incident.assigned_ambulance_number || incident.assigned_ambulance_id} as responding unit.</p>
                </div>
              )}

              {incident.assigned_hospital_id && (
                <div className="relative">
                  <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-black">
                    3
                  </div>
                  <span className="font-bold text-amber-600">Destination Hospital Allocated</span>
                  <p className="text-slate-500">Routing patient to {incident.assigned_hospital_name || incident.assigned_hospital_id}.</p>
                </div>
              )}
            </div>
          </Card>

          {/* GeoAgent Decision Support & What-If Simulation Matrix */}
          <Card>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                  GeoAgent Decision Support & Multi-Criteria Ranking
                </h3>
                <p className="text-[11px] text-slate-500">
                  Algorithmic telemetry evaluation (Road Distance, ETA, ICU Bed Headroom, Medical Level)
                </p>
              </div>
              <Badge variant="warning">AI Decision Engine</Badge>
            </div>

            {/* Explanation box */}
            <div className="p-3.5 bg-purple-50 rounded-2xl border border-purple-100 mb-4">
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 block mb-1">
                DISPATCH RATIONALE EXPLANATION
              </span>
              <p className="text-xs text-purple-950 font-medium leading-relaxed">
                {incident.assigned_hospital_name
                  ? `GeoAgent selected ${incident.assigned_hospital_name} based on real-time road proximity, critical medical capability, and live ICU headroom.`
                  : 'GeoAgent evaluated candidate fleet units and allocated the optimal proximity responder with Level-1 medical reception capability.'}
              </p>
            </div>

            {/* What-If Simulation Sandbox */}
            <div className="bg-slate-900 rounded-2xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  WHAT-IF SIMULATION SANDBOX
                </span>
                <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                  Zero-Mutation Sandbox Layer
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mb-3">
                Simulate peak hour traffic spikes (+50% delay) and emergency medical diversions without altering production database records.
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Baseline Transit</span>
                  <span className="text-emerald-400 font-bold">11 min ETA (5.2 km)</span>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                  <span className="text-slate-400 block">Simulated Peak Delay</span>
                  <span className="text-amber-400 font-bold">+6 min (SH 104A Detour)</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right 4 Cols: Units & Actions */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">ASSIGNED ASSETS</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <Ambulance className="w-4 h-4 text-red-600" />
                  <span>{incident.assigned_ambulance_number || incident.assigned_ambulance_id || 'Pending Unit Assignment'}</span>
                </div>
                <p className="text-slate-500">Status: {incident.status?.replace('_', ' ') || 'Pending'}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>{incident.assigned_hospital_name || 'Pending Hospital Allocation'}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">COMMAND OVERRIDES</h3>
            <div className="space-y-2">
              <Button variant="primary" fullWidth size="sm" onClick={() => window.open('tel:108')}>
                <Phone className="w-4 h-4 mr-1.5" />
                Patch Dispatch Audio Call
              </Button>
              <Button variant="danger" fullWidth size="sm" onClick={() => navigate('/dispatcher/routes')}>
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                Force Green Signal Corridor
              </Button>
              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => navigate(`/citizen/tracking?incidentId=${incident.id}`)}
              >
                <Compass className="w-4 h-4 mr-1.5" />
                Open Live Tracking View
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};
