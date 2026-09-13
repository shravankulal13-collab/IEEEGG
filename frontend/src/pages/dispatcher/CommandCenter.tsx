// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Central Emergency Operations Command Center (/dispatcher)
// ============================================================

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Truck,
  Radio,
  AlertTriangle,
  Building2,
  ChevronDown,
} from 'lucide-react';
import {
  incidentService,
  type IncidentRecord,
} from '../../services/incident.service';
import {
  analyticsService,
  type OperationalOverview,
  type ResponseTimeMetrics,
  type IncidentBreakdown,
} from '../../services/analytics.service';
import {
  INCIDENT_SOCKET_EVENTS,
  NOTIFICATION_SOCKET_EVENTS,
} from '../../services/socket';
import { useSocket, useSocketEvent } from '../../hooks/useSocket';
import { useLiveTracking } from '../../hooks/useLiveTracking';
import { useMapStore } from '../../store/mapStore';
import { useNotificationStore } from '../../store/notificationStore';

// Components matching reference screenshot
import { LiveStats } from '../../components/dispatcher/LiveStats';
import { EmergencyMap } from '../../components/maps/EmergencyMap';
import { IncidentQueue } from '../../components/dispatcher/IncidentQueue';
import { ResponseMetrics } from '../../components/dispatcher/ResponseMetrics';
import { OperationalAlerts } from '../../components/dispatcher/OperationalAlerts';
import { FleetStatusCard } from '../../components/dispatcher/FleetStatusCard';
import { ImplementationSection } from '../../components/dispatcher/ImplementationSection';

export const CommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const { connectionState } = useSocket();
  const { fleet, refreshFleet } = useLiveTracking();
  const { selectedIncidentId, setSelectedIncidentId } = useMapStore();
  const addNotification = useNotificationStore((s) => s.addNotification);

  // State
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [overview, setOverview] = useState<OperationalOverview | null>(null);
  const [responseTimes, setResponseTimes] = useState<ResponseTimeMetrics | null>(null);
  const [, setBreakdown] = useState<IncidentBreakdown | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock ticker for live ops timestamp
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial load & periodic poll
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [incRes, ovRes, rtRes, bkRes] = await Promise.allSettled([
        incidentService.listActive(50),
        analyticsService.getOverview(),
        analyticsService.getResponseTimes(24),
        analyticsService.getIncidentBreakdown(24),
      ]);

      if (incRes.status === 'fulfilled') {
        setIncidents(incRes.value || []);
      }
      if (ovRes.status === 'fulfilled') {
        setOverview(ovRes.value);
      }
      if (rtRes.status === 'fulfilled') {
        setResponseTimes(rtRes.value);
      }
      if (bkRes.status === 'fulfilled') {
        setBreakdown(bkRes.value);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh command center data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    refreshFleet();

    const interval = setInterval(() => {
      loadData();
    }, 15000);

    return () => clearInterval(interval);
  }, [loadData, refreshFleet]);

  // Realtime Socket Event Handlers
  useSocketEvent(INCIDENT_SOCKET_EVENTS.CREATED, (newInc: IncidentRecord) => {
    if (!newInc?.id) return;
    setIncidents((prev) => {
      if (prev.some((i) => i.id === newInc.id)) return prev;
      return [newInc, ...prev];
    });
    addNotification({
      id: `inc-created-${newInc.id}-${Date.now()}`,
      user_id: null,
      incident_id: newInc.id,
      notification_type: 'incident_created',
      title: `🚨 New Emergency Reported #${newInc.incident_number || newInc.id.slice(0, 6)}`,
      message: `${newInc.emergency_type?.toUpperCase()} incident at ${newInc.address || 'location reported'}.`,
      data: {},
      is_read: false,
      created_at: new Date().toISOString(),
      read_at: null,
    });
  });

  useSocketEvent(INCIDENT_SOCKET_EVENTS.STATUS_CHANGED, (payload: any) => {
    const incId = payload?.incident_id || payload?.id;
    const nextStatus = payload?.status || payload?.next_status;
    if (!incId || !nextStatus) return;

    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incId ? { ...inc, status: nextStatus } : inc))
    );
  });

  useSocketEvent(INCIDENT_SOCKET_EVENTS.PRIORITY_CHANGED, (payload: any) => {
    const incId = payload?.incident_id || payload?.id;
    const severity = payload?.severity;
    if (!incId || severity == null) return;

    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incId ? { ...inc, severity } : inc))
    );
  });

  useSocketEvent(INCIDENT_SOCKET_EVENTS.DISPATCHED, (payload: any) => {
    const incId = payload?.incident_id || payload?.id;
    if (!incId) return;

    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incId ? { ...inc, status: 'dispatched' } : inc))
    );
    refreshFleet();
  });

  useSocketEvent(INCIDENT_SOCKET_EVENTS.RESOLVED, (payload: any) => {
    const incId = payload?.incident_id || payload?.id;
    if (!incId) return;

    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incId ? { ...inc, status: 'resolved' } : inc))
    );
  });

  useSocketEvent(NOTIFICATION_SOCKET_EVENTS.NEW, (notif: any) => {
    if (notif?.id) {
      addNotification(notif);
    }
  });

  const criticalCount = useMemo(
    () => incidents.filter((i) => (i.severity ?? 0) >= 4 && i.status !== 'resolved' && i.status !== 'cancelled').length,
    [incidents]
  );

  const scrollToQueue = () => {
    const queueElement = document.getElementById('live-incident-queue');
    if (queueElement) {
      queueElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToOperations = () => {
    const opsElement = document.getElementById('live-operations');
    if (opsElement) {
      opsElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 max-w-[1780px] mx-auto pb-6 select-none">
      {/* ============================================================ */}
      {/* PART 1 — LARGE DARK HERO SECTION (75-90vh DESKTOP FEEL)     */}
      {/* ============================================================ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#07133A] via-[#060F2E] to-[#050B24] border border-blue-900/40 p-6 md:p-10 shadow-2xl">
        {/* Background ambulance artwork & cyber glow overlay */}
        <div
          className="absolute right-0 top-0 bottom-0 w-full sm:w-2/3 lg:w-3/5 bg-cover bg-center pointer-events-none opacity-25 mix-blend-screen"
          style={{
            backgroundImage: "url('/assets/hero-ambulance.jpg')",
            maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 35%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.8) 35%, rgba(0,0,0,1) 100%)',
          }}
        />

        {/* Integrated Top Navigation Bar inside Hero */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-blue-900/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-display font-black text-xl tracking-tight text-white">
              <span>ResQ</span>
              <span className="text-[#FF1F2D] drop-shadow-[0_0_8px_rgba(255,31,45,0.6)]">Grid</span>
            </div>
            <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-[11px] font-mono font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>System Operational</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1 bg-[#050B24]/90 p-1 rounded-xl border border-blue-900/50 backdrop-blur-sm">
            <button
              onClick={scrollToOperations}
              className="px-3 py-1 rounded-lg text-xs font-semibold bg-[#2563EB] text-white shadow-xs"
            >
              Dashboard
            </button>
            <button
              onClick={() => navigate('/dispatcher/incidents')}
              className="px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-900/40 transition-colors"
            >
              Incident Queue
            </button>
            <button
              onClick={() => navigate('/dispatcher/fleet')}
              className="px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-900/40 transition-colors"
            >
              Fleet Telemetry
            </button>
            <button
              onClick={() => navigate('/dispatcher/analytics')}
              className="px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-900/40 transition-colors"
            >
              Analytics
            </button>
            <button
              onClick={() => navigate('/dispatcher/audit')}
              className="px-3 py-1 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-blue-900/40 transition-colors"
            >
              Protocols
            </button>
          </nav>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="hidden md:flex flex-col text-right">
              <span className="font-semibold text-slate-200">Bengaluru Command Hub</span>
              <span className="text-[10px] text-cyan-400 font-mono tracking-wider">LIVE DISPATCH ACTIVE</span>
            </div>
          </div>
        </div>

        {/* 2-Column Hero Body */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-8 md:py-12">
          {/* Left Column (7 cols): Headline, Text, CTAs, Micro-badges */}
          <div className="lg:col-span-7 space-y-5">
            {/* Tagline Badge */}
            <div className="ops-hero-enter-1 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/70 text-cyan-400 text-[11px] font-mono font-bold tracking-wider shadow-inner">
              <span className="w-2 h-2 rounded-full bg-[#FF1F2D] animate-ping" />
              <span>EMERGENCY DISPATCH & FLEET INTELLIGENCE</span>
            </div>

            {/* Main Heading with highlighted red Command Center */}
            <h1 className="ops-hero-enter-2 text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight font-display leading-[1.15]">
              Emergency <span className="text-[#FF1F2D] drop-shadow-[0_0_20px_rgba(255,31,45,0.6)]">Command Center</span>
            </h1>

            {/* Subheading */}
            <p className="ops-hero-enter-3 text-base sm:text-lg text-cyan-300 font-semibold tracking-wide">
              Real-time coordination. Faster response. Safer communities.
            </p>

            {/* Supporting Description */}
            <p className="ops-hero-enter-4 text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              Monitor live incidents, track ambulance fleet, coordinate with hospitals and manage multi-agency operations — all in one integrated platform.
            </p>

            {/* CTA Action Buttons */}
            <div className="ops-hero-enter-5 flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={scrollToQueue}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs md:text-sm font-bold text-white bg-[#FF1F2D] hover:bg-[#E91524] shadow-[0_0_24px_rgba(255,31,45,0.5)] transition-all transform hover:-translate-y-0.5"
              >
                <span>View Live Incidents</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/dispatcher/fleet')}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs md:text-sm font-semibold text-slate-200 bg-[#07133A]/90 hover:bg-[#0B1B4A] border border-blue-700/60 hover:border-blue-500 transition-all"
              >
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Fleet Telemetry</span>
              </button>
            </div>

            {/* Micro-Badges */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-blue-900/40 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-amber-400">⚡</span>
                <span>Faster Response</span>
              </div>
              <div className="text-slate-600">•</div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-cyan-400">🤝</span>
                <span>Better Coordination</span>
              </div>
              <div className="text-slate-600">•</div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="text-emerald-400">🛡️</span>
                <span>Safer Communities</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Connected Telemetry Nodes Visual Showcase */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            <div className="w-full max-w-md rounded-2xl bg-gradient-to-br from-[#050B24]/95 to-[#07133A]/95 border border-blue-800/50 p-6 shadow-2xl relative overflow-hidden backdrop-blur-md">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-blue-900/50">
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider">
                    Live Response Telemetry
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/60">
                  24/7 ACTIVE
                </span>
              </div>

              {/* 3 Connected Emergency Flow Nodes */}
              <div className="space-y-3 relative">
                {/* Node 1: Incident Detected */}
                <div className="flex items-center gap-4 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 shadow-xs relative">
                  <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-sm shadow-[0_0_16px_rgba(239,68,68,0.6)] shrink-0 animate-pulse">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-wide">1. Incident Detected</span>
                      <span className="text-[10px] font-mono text-red-400 font-semibold animate-pulse">PRIORITY 1</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">Immediate multi-channel SOS triage</p>
                  </div>
                </div>

                {/* Animated Connector 1 */}
                <div className="flex items-center justify-center my-1">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-red-500 to-blue-500 relative">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 absolute left-1/2 -translate-x-1/2 animate-ping" />
                  </div>
                </div>

                {/* Node 2: Ambulance En Route */}
                <div className="flex items-center gap-4 p-3.5 rounded-xl bg-blue-950/40 border border-blue-500/40 shadow-xs relative">
                  <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-sm shadow-[0_0_16px_rgba(37,99,235,0.6)] shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-wide">2. Ambulance En Route</span>
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold">GPS TELEMETRY</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">Optimized routing with green corridor</p>
                  </div>
                </div>

                {/* Animated Connector 2 */}
                <div className="flex items-center justify-center my-1">
                  <div className="w-0.5 h-6 bg-gradient-to-b from-blue-500 to-emerald-500 relative">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute left-1/2 -translate-x-1/2 animate-ping" />
                  </div>
                </div>

                {/* Node 3: Hospital Receiving */}
                <div className="flex items-center gap-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 shadow-xs relative">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-[0_0_16px_rgba(16,185,129,0.6)] shrink-0">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white tracking-wide">3. Hospital Receiving</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">TRAUMA READY</span>
                    </div>
                    <p className="text-[11px] text-slate-300 truncate">Bed allocated & vitals pre-synced</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-blue-900/40 text-center">
                <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase">
                  CONNECTING PEOPLE • RESPONSE • LIVES
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator at base of Hero */}
        <div className="flex flex-col items-center justify-center pt-4 select-none text-slate-400">
          <button
            type="button"
            onClick={scrollToOperations}
            className="group flex flex-col items-center gap-1.5 cursor-pointer focus:outline-none"
          >
            <div className="w-6 h-10 rounded-full border-2 border-slate-500/60 group-hover:border-cyan-400 flex items-start justify-center p-1 transition-colors">
              <div className="w-1.5 h-2.5 rounded-full bg-cyan-400 ops-scroll-wheel shadow-[0_0_6px_#22d3ee]" />
            </div>
            <span className="text-[11px] font-semibold text-slate-400 group-hover:text-cyan-300 tracking-wider uppercase flex items-center gap-1 transition-colors">
              Scroll to continue
              <ChevronDown className="w-3.5 h-3.5 animate-bounce" />
            </span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SCROLL-DRIVEN TRANSITION DIVIDER INTO CLEAN WHITE DASHBOARD   */}
      {/* ============================================================ */}
      <div className="relative w-full overflow-hidden leading-none pointer-events-none -my-2">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-8 md:h-12 text-slate-100 block"
        >
          <path
            d="M0,0 C360,45 1080,45 1440,0 L1440,60 L0,60 Z"
            fill="#FFFFFF"
          />
        </svg>
      </div>

      {/* ============================================================ */}
      {/* PART 2 — CLEAN WHITE OPERATIONAL DASHBOARD                   */}
      {/* ============================================================ */}
      <div
        id="live-operations"
        className="bg-white text-slate-900 rounded-3xl p-5 md:p-8 space-y-6 border border-slate-200/80 shadow-md transition-colors"
      >
        {/* White Operational Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#FF1F2D] mb-1">
              — LIVE OPERATIONS
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Operational Overview
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium">
              Real-time multi-agency incident tracking, ambulance telemetry, and hospital trauma coordination.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-800 font-mono">
                {currentTime.toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </div>
              <div className="text-[11px] font-mono text-slate-500">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Data</span>
            </div>
          </div>
        </div>

        {/* 5 Operational KPI Cards Row */}
        <section aria-label="Command Center Live KPIs">
          <LiveStats
            overview={overview}
            criticalIncidentsCount={criticalCount}
            loading={loading}
          />
        </section>

        {/* Main Center Workspace: Split into Left Column & Right Column */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* LEFT COLUMN (8 columns): Live Operations Map + Response Metrics & Operational Alerts */}
          <div className="lg:col-span-8 space-y-5">
            {/* Map Card in Clean White Container */}
            <div className="w-full h-[520px]">
              <EmergencyMap
                incidents={incidents}
                ambulances={fleet}
                onSelectIncident={(inc) => setSelectedIncidentId(inc.id)}
                onSelectAmbulance={() => {}}
                className="h-full"
              />
            </div>

            {/* Bottom Row under Map: Response Metrics (Left) + Operational Alerts (Right) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <ResponseMetrics
                responseTimes={responseTimes}
                loading={loading}
              />
              <OperationalAlerts
                incidents={incidents}
                overview={overview}
                connectionState={connectionState}
                onSelectIncident={(inc) => setSelectedIncidentId(inc.id)}
              />
            </div>
          </div>

          {/* RIGHT COLUMN (4 columns): Live Incident Queue + Fleet Status */}
          <div className="lg:col-span-4 space-y-5" id="live-incident-queue">
            {/* Live Incident Queue */}
            <div className="h-[520px]">
              <IncidentQueue
                incidents={incidents}
                selectedIncidentId={selectedIncidentId}
                onSelectIncident={(inc) => setSelectedIncidentId(inc.id)}
                onViewDetails={(inc) => navigate(`/dispatcher/incidents/${inc.id}`)}
                loading={loading}
                error={error}
                onRefresh={loadData}
              />
            </div>

            {/* Fleet Status Card with Donut Chart and Availability */}
            <FleetStatusCard fleet={fleet} />
          </div>
        </div>

        {/* ============================================================ */}
        {/* PART 3 — WHITE IMPLEMENTATION STORY & WORKFLOW              */}
        {/* ============================================================ */}
        <ImplementationSection />
      </div>
    </div>
  );
};
