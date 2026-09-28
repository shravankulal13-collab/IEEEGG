// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Central Emergency Command Center
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIncidentStore } from '../../store/incidentStore';
import { useHospitalStore } from '../../store/hospitalStore';
import { ambulanceService, type AmbulanceData } from '../../services/ambulance.service';
import { AppShell } from '../../components/layout/AppShell';
import { HeroSection } from '../../components/layout/HeroSection';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Radio,
  Ambulance,
  Building2,
  Zap,
  Brain,
} from 'lucide-react';
import { EmergencyMap } from '../../components/maps/EmergencyMap';
import { DecisionTraceModal } from '../../components/dispatcher/DecisionTraceModal';
import { DemoScenarioPanel } from '../../components/dispatcher/DemoScenarioPanel';

export const CommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'critical' | 'dispatched' | 'en_route'>('all');
  const [isDecisionTraceOpen, setIsDecisionTraceOpen] = useState(false);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('ER-77');
  const { incidents, isLoading: isIncidentsLoading, error: incidentsError, fetchIncidents } = useIncidentStore();
  const { hospitals, fetchHospitals } = useHospitalStore();
  const [ambulances, setAmbulances] = useState<AmbulanceData[]>([]);

  useEffect(() => {
    fetchIncidents();
    fetchHospitals();
    ambulanceService.getAllAmbulances().then(setAmbulances).catch(() => setAmbulances([]));

    const interval = setInterval(() => {
      fetchIncidents();
      ambulanceService.getAllAmbulances().then(setAmbulances).catch(() => { });
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchIncidents, fetchHospitals]);

  const safeIncidents = (incidents || []).filter((i) =>
    !(i.title && i.title.toLowerCase().includes('robbery')) &&
    !(i.title && i.title.toLowerCase().includes('test'))
  );
  const safeAmbulances = ambulances || [];
  const safeHospitals = hospitals || [];

  const activeCount = safeIncidents.length;
  const availableAmbs = safeAmbulances.filter((a) => a?.status && String(a.status).toLowerCase() === 'available').length;
  const totalIcuBeds = safeHospitals.reduce((sum, h) => sum + (h?.available_icu_beds ?? (h as any)?.availableICUBeds ?? 0), 0);

  const stats = [
    { label: 'Active Incidents', value: String(activeCount), change: 'Live Grid', icon: <Radio className="w-5 h-5 text-red-600 animate-pulse" /> },
    { label: 'Fleet Ready', value: `${availableAmbs} / ${safeAmbulances.length}`, change: 'Available Units', icon: <Ambulance className="w-5 h-5 text-blue-600" /> },
    { label: 'Medical Centers', value: String(safeHospitals.length), change: `${totalIcuBeds} ICU Beds Free`, icon: <Building2 className="w-5 h-5 text-emerald-600" /> },
    { label: 'Dispatch Latency', value: '< 500 ms', change: 'Instant Dispatch', icon: <Zap className="w-5 h-5 text-purple-600" /> },
  ];

  const filteredIncidents =
    filter === 'all'
      ? safeIncidents
      : safeIncidents.filter((inc) => String(inc.severity) === filter || String(inc.status) === filter);

  return (
    <AppShell sidebarVariant="top">
      <HeroSection
        badgeText=""
        headingPrefix="Coordinate Faster"
        typewriterPhrases={[
          'Emergency Medical Corridors',
          'Autonomous Fleet Dispatches',
          'Traffic Clearance Green Waves',
          'Hospital ICU Capacity'
        ]}
        headingSuffix="with ResQGrid"
        subtitle="Coordinate incidents, ambulances, traffic clearance, and hospital availability from one emergency operations center."
        primaryCta={{
          label: "View Fleet Telemetry",
          onClick: () => navigate('/dispatcher/fleet'),
          variant: "red"
        }}
        secondaryCta={{
          label: "System Analytics",
          onClick: () => navigate('/dispatcher/analytics')
        }}
        tickerItems={[
          { text: `${safeAmbulances.length} Units in Fleet` },
          { text: `${safeHospitals.length} Medical Hospitals` },
          { text: `${activeCount} Incidents Logged` },
          { text: `${totalIcuBeds} Free ICU Beds` }
        ]}
      />

      {/* Top Benchmark Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="hover-lift">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{stat.label}</span>
              {stat.icon}
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{stat.value}</span>
              <span className="text-xs font-bold text-emerald-400">{stat.change}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Live Map & Active Incidents Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Interactive Real-Time Map Canvas */}
        <div className="lg:col-span-7 h-[500px]">
          <EmergencyMap
            incidents={safeIncidents.map((inc) => ({
              id: inc.id,
              incidentNumber: inc.incident_number ? String(inc.incident_number) : inc.id,
              type: (inc.emergency_type as any) || 'medical',
              severity: (inc.severity as any) || 'critical',
              lat: inc.latitude || 12.9716,
              lng: inc.longitude || 77.5946,
              address: inc.address || 'GPS Coordinates',
            }))}
            ambulances={safeAmbulances.map((a) => ({
              id: a.id,
              unitCode: a.ambulance_number || 'AMB',
              type: (a.ambulance_type as any) || 'ALS',
              status: (a.status as any) || 'available',
              speedKmH: a.current_speed_kmh || 0,
              heading: a.current_heading || 0,
              lat: a.current_latitude || (a as any).latitude || 12.9716,
              lng: a.current_longitude || (a as any).longitude || 77.5946,
            }))}
            hospitals={safeHospitals.map((h) => ({
              id: h.id,
              name: h.name,
              traumaLevel: h.trauma_level || 'Level 1',
              icuBedsAvailable: h.available_icu_beds ?? (h as any).availableICUBeds ?? 0,
              lat: h.latitude || 12.8953,
              lng: h.longitude || 77.5986,
            }))}
            showGreenCorridor={true}
            className="h-full"
          />
        </div>

        {/* Right: AI Dispatch Scoring Matrix */}
        <div className="lg:col-span-5 bg-[#0B1B4F] rounded-3xl p-6 border border-[#1E3A8A] shadow-xl flex flex-col justify-between text-white">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-white">Automated Dispatch Engine</h3>
                <p className="text-xs text-slate-300">Proximity and hospital capability matching</p>
              </div>
              <span className="px-2.5 py-1 bg-blue-500/20 text-sky-300 rounded-full text-xs font-bold border border-blue-500/30">
                Rapid Triaging
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span>Emergency Grid Status</span>
                  <span className="text-emerald-400 font-bold">Active & Synced</span>
                </div>
                <p className="text-xs text-slate-300">{activeCount} active incidents managed on network.</p>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-white/10">
                <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                  <span>Available Responders</span>
                  <span className="text-sky-400 font-bold">{availableAmbs} Units Ready</span>
                </div>
                <p className="text-xs text-slate-300">Active fleet units ready for automated dispatch assignment.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => {
                setSelectedIncidentId(safeIncidents[0]?.id || 'ER-77');
                setIsDecisionTraceOpen(true);
              }}
              className="w-full sm:flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Brain className="w-4 h-4 text-sky-300" />
              <span>VIEW DECISION TRACE</span>
            </button>
            <Button
              variant="danger"
              onClick={() => navigate('/citizen/report')}
              className="w-full sm:w-auto"
            >
              Manual Intake
            </Button>
          </div>
        </div>
      </div>

      {/* Controlled Judge Demo & Simulation Controls */}
      <div className="mb-8">
        <DemoScenarioPanel
          activeIncidentId={safeIncidents[0]?.incident_number ? `ER-${safeIncidents[0].incident_number}` : (safeIncidents[0]?.id || 'ER-77')}
          onScenarioInjected={() => {
            fetchIncidents();
          }}
          onResetCompleted={() => {
            fetchIncidents();
            fetchHospitals();
          }}
        />
      </div>

      {/* Incident Queue Table */}
      <div className="bg-[#0B1B4F] rounded-3xl border border-[#1E3A8A] shadow-xl p-6 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-white">Active Incident Stream</h3>
            <p className="text-xs text-slate-300">Real-time coordinated responses across all city sectors</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-900/80 rounded-xl border border-white/10 text-xs font-bold">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === 'all' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                All ({incidents.length})
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === 'critical' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilter('en_route')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filter === 'en_route' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
                }`}
              >
                En Route
              </button>
            </div>
          </div>
        </div>

        {isIncidentsLoading && incidents.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center">
            <Spinner size="lg" />
            <p className="text-xs font-bold text-slate-300 mt-3">Loading emergency incident queue...</p>
          </div>
        )}

        {incidentsError && !isIncidentsLoading && (
          <div className="my-4">
            <ErrorState message={`Unable to load incident queue: ${incidentsError}`} onRetry={fetchIncidents} />
          </div>
        )}

        {!isIncidentsLoading && !incidentsError && filteredIncidents.length === 0 && (
          <EmptyState
            title="No Active Incidents"
            description="No active emergency incidents currently in this queue."
            action={{
              label: 'Report New Emergency',
              onClick: () => navigate('/citizen/report'),
            }}
          />
        )}

        {!isIncidentsLoading && !incidentsError && filteredIncidents.length > 0 && (
          <div className="overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-xs text-white">
              <thead className="bg-slate-900/90 text-slate-200 font-extrabold uppercase tracking-wider text-[10px] border-b border-white/10">
                <tr>
                  <th className="py-3.5 px-4">Incident ID</th>
                  <th className="py-3.5 px-4">Emergency Type</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Assigned Unit</th>
                  <th className="py-3.5 px-4">Destination Hospital</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 font-medium text-slate-200">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{inc.incident_number ? `ER-${inc.incident_number}` : inc.id}</td>
                    <td className="py-3.5 px-4 font-bold capitalize text-white">{inc.emergency_type || 'Medical'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          String(inc.severity) === '5' || String(inc.severity).toLowerCase() === 'critical'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}
                      >
                        {String(
                          inc.severity === 5 || String(inc.severity).toLowerCase() === 'critical'
                            ? 'CRITICAL'
                            : inc.severity === 4 || String(inc.severity).toLowerCase() === 'high'
                              ? 'HIGH'
                              : inc.severity === 3 || String(inc.severity).toLowerCase() === 'medium' || String(inc.severity).toLowerCase() === 'moderate'
                                ? 'MEDIUM'
                                : inc.severity || 'HIGH'
                        ).toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{inc.address || `${inc.latitude}, ${inc.longitude}`}</td>
                    <td className="py-3.5 px-4 font-bold text-sky-400">{inc.assigned_ambulance_number || inc.assigned_ambulance_id || 'Pending Unit'}</td>
                    <td className="py-3.5 px-4 text-slate-200">{inc.assigned_hospital_name || 'Pending Hospital'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedIncidentId(inc.id);
                            setIsDecisionTraceOpen(true);
                          }}
                          className="px-3 py-1.5 bg-sky-950/90 hover:bg-sky-900 text-sky-300 border border-sky-500/40 rounded-xl font-bold text-xs transition cursor-pointer flex items-center gap-1"
                          title="View GeoAgent Hospital Decision Trace"
                        >
                          <Brain className="w-3.5 h-3.5" />
                          <span>Trace</span>
                        </button>
                        <button
                          onClick={() => navigate(`/dispatcher/incidents/${inc.id}`)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Decision Trace Modal */}
      <DecisionTraceModal
        incidentId={selectedIncidentId}
        isOpen={isDecisionTraceOpen}
        onClose={() => setIsDecisionTraceOpen(false)}
      />
    </AppShell>
  );
};
