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
} from 'lucide-react';
import { EmergencyMap } from '../../components/maps/EmergencyMap';

export const CommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'critical' | 'dispatched' | 'en_route'>('all');
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

  const safeIncidents = incidents || [];
  const safeAmbulances = ambulances || [];
  const safeHospitals = hospitals || [];

  const activeCount = safeIncidents.length;
  const availableAmbs = safeAmbulances.filter((a) => a?.status && String(a.status).toLowerCase() === 'available').length;
  const totalIcuBeds = safeHospitals.reduce((sum, h) => sum + (h?.available_icu_beds ?? (h as any)?.availableICUBeds ?? 0), 0);

  const stats = [
    { label: 'Active Incidents', value: String(activeCount), change: 'Live Database' },
    { label: 'Fleet Ready', value: `${availableAmbs} / ${safeAmbulances.length}`, change: 'Available Units' },
    { label: 'Trauma Centers', value: String(safeHospitals.length), change: `${totalIcuBeds} ICU Beds Free` },
    { label: 'Dispatch Latency', value: '< 500 ms', change: 'PostGIS Engine' },
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
          'Emergency Response',
          'Ambulance Dispatch',
          'Traffic Clearance',
          'Hospital Coordination',
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
          { text: `${safeHospitals.length} Trauma Hospitals` },
          { text: `${activeCount} Incidents Logged` },
          { text: `${totalIcuBeds} Free ICU Beds` }
        ]}
      />

      {/* Top Benchmark Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <Card key={i} className="hover-lift">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stat.value}</span>
              <span className="text-xs font-bold text-emerald-600">{stat.change}</span>
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
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">AI Dispatch Engine</h3>
                <p className="text-xs text-slate-500">PostGIS proximity & capability scoring</p>
              </div>
              <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-200">
                Sub-Second Triaging
              </span>
            </div>

            <div className="space-y-3 mb-6">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Active Database Status</span>
                  <span className="text-emerald-600 font-black">PostgreSQL Synced</span>
                </div>
                <p className="text-[11px] text-slate-500">{activeCount} total incidents recorded in database.</p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 mb-1">
                  <span>Available Responders</span>
                  <span className="text-blue-600 font-black">{availableAmbs} Units Ready</span>
                </div>
                <p className="text-[11px] text-slate-500">Live PostGIS fleet ready for automated dispatch assignment.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
            <Button
              variant="danger"
              fullWidth
              onClick={() => navigate('/citizen/report')}
            >

              Manual Emergency Intake
            </Button>
          </div>
        </div>
      </div>

      {/* Incident Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_10px_30px_rgba(0,0,0,0.06)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Active Incident Triage Stream</h3>
            <p className="text-xs text-slate-500">Real-time coordinated responses across all city sectors</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
              >
                All ({incidents.length})
              </button>
              <button
                onClick={() => setFilter('critical')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'critical' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                  }`}
              >
                Critical
              </button>
              <button
                onClick={() => setFilter('en_route')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filter === 'en_route' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
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
            <p className="text-xs font-bold text-slate-500 mt-3">Loading emergency incidents from database...</p>
          </div>
        )}

        {incidentsError && !isIncidentsLoading && (
          <div className="my-4">
            <ErrorState message={`Database Error: ${incidentsError}`} onRetry={fetchIncidents} />
          </div>
        )}

        {!isIncidentsLoading && !incidentsError && filteredIncidents.length === 0 && (
          <EmptyState
            title="No Active Incidents"
            description="The database is connected and there are currently no emergency incidents in this queue."
            action={{
              label: 'Report New Emergency',
              onClick: () => navigate('/citizen/report'),
            }}
          />
        )}

        {!isIncidentsLoading && !incidentsError && filteredIncidents.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Incident ID</th>
                  <th className="py-3 px-4">Emergency Type</th>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Assigned Unit</th>
                  <th className="py-3 px-4">Destination Hospital</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{inc.incident_number ? `ER-${inc.incident_number}` : inc.id}</td>
                    <td className="py-3.5 px-4 font-bold capitalize">{inc.emergency_type || 'Medical'}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${String(inc.severity) === '5' || String(inc.severity).toLowerCase() === 'critical'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
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
                    <td className="py-3.5 px-4 text-slate-600">{inc.address || `${inc.latitude}, ${inc.longitude}`}</td>
                    <td className="py-3.5 px-4 font-bold text-blue-600">{inc.assigned_ambulance_number || inc.assigned_ambulance_id || 'Pending Unit'}</td>
                    <td className="py-3.5 px-4">{inc.assigned_hospital_name || 'Pending Hospital'}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/dispatcher/incidents/${inc.id}`)}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] transition-colors"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
};
