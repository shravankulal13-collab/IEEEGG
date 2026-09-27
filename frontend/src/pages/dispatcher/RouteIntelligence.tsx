// ============================================================
// PRIMARY OWNER: Anush KD
// ROLE: Traffic & Routing Optimization Lead
// MODULE: Pan-India Green Corridor Routing Engine & Signal Preemption
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Zap,
  RefreshCw,
  Navigation,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

interface CorridorPreset {
  id: string;
  name: string;
  city: string;
  ambulanceCode: string;
  origin: string;
  destination: string;
  standardDurationMins: number;
  preemptedDurationMins: number;
  distanceKm: number;
  preemptedSignalsCount: number;
  signals: {
    name: string;
    distanceOffset: string;
    preemptState: 'HOLD_GREEN' | 'PREEMPTING' | 'QUEUED';
    holdDurationSeconds: number;
  }[];
}

const CORRIDOR_PRESETS: CorridorPreset[] = [
  {
    id: 'cor-del-1',
    name: 'AIIMS Ring Road Rapid Trauma Wave',
    city: 'Delhi NCR',
    ambulanceCode: 'AMB-104 (ALS)',
    origin: 'DND Flyway Entry (Sector 18)',
    destination: 'AIIMS Apex Trauma Center',
    standardDurationMins: 38,
    preemptedDurationMins: 16,
    distanceKm: 14.8,
    preemptedSignalsCount: 7,
    signals: [
      { name: 'Ashram Chowk Underpass Corridor', distanceOffset: '2.4 km', preemptState: 'HOLD_GREEN', holdDurationSeconds: 45 },
      { name: 'Barapullah Elevated Merge', distanceOffset: '5.8 km', preemptState: 'HOLD_GREEN', holdDurationSeconds: 60 },
      { name: 'Lajpat Nagar Ring Road Junction', distanceOffset: '9.2 km', preemptState: 'PREEMPTING', holdDurationSeconds: 30 },
      { name: 'South Extension Flyover Approach', distanceOffset: '12.6 km', preemptState: 'QUEUED', holdDurationSeconds: 40 },
      { name: 'AIIMS Trauma Emergency Gate 2', distanceOffset: '14.8 km', preemptState: 'QUEUED', holdDurationSeconds: 90 },
    ],
  },
  {
    id: 'cor-blr-1',
    name: 'Outer Ring Road to Apollo Bannerghatta',
    city: 'Bengaluru',
    ambulanceCode: 'AMB-108 (ALS)',
    origin: 'Bellandur EcoSpace Tech Park',
    destination: 'Apollo Hospital Bannerghatta',
    standardDurationMins: 46,
    preemptedDurationMins: 18,
    distanceKm: 15.2,
    preemptedSignalsCount: 8,
    signals: [
      { name: 'Silk Board Junction Flyover Inbound', distanceOffset: '4.1 km', preemptState: 'HOLD_GREEN', holdDurationSeconds: 55 },
      { name: 'BTM 2nd Stage Ring Road Crossing', distanceOffset: '7.6 km', preemptState: 'HOLD_GREEN', holdDurationSeconds: 45 },
      { name: 'Jayadeva Underpass Bypass', distanceOffset: '10.8 km', preemptState: 'PREEMPTING', holdDurationSeconds: 35 },
      { name: 'Bannerghatta Main Rd / Vega City', distanceOffset: '13.4 km', preemptState: 'QUEUED', holdDurationSeconds: 40 },
      { name: 'Apollo Trauma Emergency Bay', distanceOffset: '15.2 km', preemptState: 'QUEUED', holdDurationSeconds: 75 },
    ],
  },
  {
    id: 'cor-mum-1',
    name: 'Western Express Highway to Lilavati',
    city: 'Mumbai',
    ambulanceCode: 'AMB-102 (ALS)',
    origin: 'Andheri West JVLR Junction',
    destination: 'Lilavati Hospital Bandra',
    standardDurationMins: 52,
    preemptedDurationMins: 22,
    distanceKm: 12.6,
    preemptedSignalsCount: 6,
    signals: [
      { name: 'Santacruz Airport WEH Flyover', distanceOffset: '3.2 km', preemptState: 'HOLD_GREEN', holdDurationSeconds: 60 },
      { name: 'Kalanagar Bandra Reclamation Cross', distanceOffset: '8.4 km', preemptState: 'PREEMPTING', holdDurationSeconds: 45 },
      { name: 'Bandra Reclamation Highway Loop', distanceOffset: '11.0 km', preemptState: 'QUEUED', holdDurationSeconds: 30 },
      { name: 'Lilavati Resuscitation Ramp', distanceOffset: '12.6 km', preemptState: 'QUEUED', holdDurationSeconds: 80 },
    ],
  },
  {
    id: 'cor-hyd-1',
    name: 'HITEC City to Continental Gachibowli',
    city: 'Hyderabad',
    ambulanceCode: 'AMB-106 (ALS)',
    origin: 'Mindspace IT Hub Madhapur',
    destination: 'Continental Hospitals Gachibowli',
    standardDurationMins: 32,
    preemptedDurationMins: 12,
    distanceKm: 9.4,
    preemptedSignalsCount: 5,
    signals: [
      { name: 'Cyber Towers Junction Crossing', distanceOffset: '1.8 km', preemptState: 'HOLD_GREEN', holdDurationSeconds: 50 },
      { name: 'Biodiversity Flyover Elevated Wave', distanceOffset: '4.6 km', preemptState: 'HOLD_GREEN', holdDurationSeconds: 45 },
      { name: 'Gachibowli Stadium Crossing', distanceOffset: '7.2 km', preemptState: 'PREEMPTING', holdDurationSeconds: 35 },
      { name: 'Financial District Emergency Inbound', distanceOffset: '9.4 km', preemptState: 'QUEUED', holdDurationSeconds: 60 },
    ],
  },
];

export const RouteIntelligence: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCorridorId, setSelectedCorridorId] = useState<string>(CORRIDOR_PRESETS[0].id);
  const [activePreset, setActivePreset] = useState<CorridorPreset>(CORRIDOR_PRESETS[0]);
  const [isPreemptionActive, setIsPreemptionActive] = useState<boolean>(true);
  const [signalTimers, setSignalTimers] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const found = CORRIDOR_PRESETS.find((c) => c.id === selectedCorridorId) || CORRIDOR_PRESETS[0];
    setActivePreset(found);

    const initialTimers: { [key: string]: number } = {};
    found.signals.forEach((s) => {
      initialTimers[s.name] = s.holdDurationSeconds;
    });
    setSignalTimers(initialTimers);
  }, [selectedCorridorId]);

  useEffect(() => {
    if (!isPreemptionActive) return;
    const interval = setInterval(() => {
      setSignalTimers((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (next[k] > 1) {
            next[k] -= 1;
          } else {
            next[k] = Math.floor(Math.random() * 30) + 30; // reset
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPreemptionActive]);

  const timeSavedMins = activePreset.standardDurationMins - activePreset.preemptedDurationMins;
  const timeSavedPercent = Math.round((timeSavedMins / activePreset.standardDurationMins) * 100);

  return (
    <AppShell sidebarVariant="top">
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Header */}
        <PageHeader
          pillTag="Autonomous Signal Clearance & Green Wave"
          title="Dynamic Green Corridor & Signal Preemption Engine"
          subtitle="Real-time multi-junction traffic signal preemption, dynamic bottleneck evasion, and emergency green-wave telemetry."
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/dispatcher')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Command Center
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => navigate('/dispatcher/traffic')}
              >
                Traffic Radar
              </Button>
            </div>
          }
        />

        {/* Corridor Presets Across India */}
        <div className="bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl p-2.5 shadow-xl flex items-center gap-2 overflow-x-auto scrollbar-none text-white">
          <span className="text-xs font-bold text-slate-300 px-2 shrink-0">Corridor Preset:</span>
          {CORRIDOR_PRESETS.map((cor) => (
            <button
              key={cor.id}
              onClick={() => setSelectedCorridorId(cor.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                selectedCorridorId === cor.id
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${selectedCorridorId === cor.id ? 'text-white' : 'text-slate-400'}`} />
              <span>{cor.city}: {cor.name}</span>
            </button>
          ))}
        </div>

        {/* 3 Overview Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="hover-lift p-4 bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl shadow-xl text-white">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">ACTIVE PREEMPTED SIGNALS</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-emerald-400">{activePreset.preemptedSignalsCount} Junctions</span>
              <span className="text-xs font-bold text-emerald-300">Preempted</span>
            </div>
            <p className="text-[11px] font-bold text-slate-300 mt-1">Zero-delay green wave active</p>
          </div>

          <div className="hover-lift p-4 bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl shadow-xl text-white">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">TRANSIT TIME REDUCTION</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-sky-400">-{timeSavedMins} mins</span>
              <span className="text-xs font-bold text-sky-300">({timeSavedPercent}% Faster)</span>
            </div>
            <p className="text-[11px] font-bold text-slate-300 mt-1">
              {activePreset.preemptedDurationMins}m with Green Wave vs {activePreset.standardDurationMins}m regular
            </p>
          </div>

          <div className="hover-lift p-4 bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl shadow-xl text-white">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">CORRIDOR DISTANCE</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-black text-purple-400">{activePreset.distanceKm} km</span>
              <span className="text-xs font-bold text-purple-300">Protected</span>
            </div>
            <p className="text-[11px] font-bold text-slate-300 mt-1">Assigned to {activePreset.ambulanceCode}</p>
          </div>
        </div>

        {/* Main Grid: Corridor Live Visualizer & Signal Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Interactive Green Corridor Overview */}
          <div className="lg:col-span-8 bg-[#0B1B4F] rounded-3xl p-6 text-white min-h-[400px] relative overflow-hidden flex flex-col justify-between shadow-2xl border border-blue-500/30">


            {/* Header Badge */}
            <div className="relative z-10 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 bg-emerald-950/90 px-3.5 py-1.5 rounded-full border border-emerald-500/50 text-emerald-400 text-xs font-black">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>GREEN WAVE CORRIDOR ACTIVE</span>
              </div>
              <span className="text-xs text-slate-300 font-mono font-bold bg-white/10 px-3 py-1 rounded-full">
                ETA: {activePreset.preemptedDurationMins} min (Saved: {timeSavedMins} min)
              </span>
            </div>

            {/* Visual Route Corridor Stepper */}
            <div className="relative z-10 my-8 space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500 ring-4 ring-red-500/30" />
                  <span>Origin: {activePreset.origin}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/30" />
                  <span>Destination: {activePreset.destination}</span>
                </div>
              </div>

              {/* Highway Visual Bar with Junction Points */}
              <div className="relative h-6 bg-slate-800/80 rounded-full border border-slate-700 p-1 flex items-center shadow-inner">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 rounded-full w-full opacity-90 animate-pulse" />
                {activePreset.signals.map((sig, idx) => (
                  <div
                    key={idx}
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-900 shadow-md transform -translate-x-1/2"
                    style={{ left: `${((idx + 1) / (activePreset.signals.length + 1)) * 100}%` }}
                    title={`${sig.name} (${sig.preemptState})`}
                  />
                ))}
              </div>
            </div>

            {/* Active Signal Telemetry HUD Box */}
            <div className="relative z-10 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-700/80 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Live Signal State Preemption Sequence ({activePreset.city})</span>
                </h4>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {activePreset.preemptedSignalsCount} Traffic Lights Synchronized
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {activePreset.signals.map((sig) => (
                  <div
                    key={sig.name}
                    className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-white truncate">{sig.name}</p>
                      <p className="text-[10px] text-slate-400 font-mono">Distance: {sig.distanceOffset}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 ${
                        sig.preemptState === 'HOLD_GREEN'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : sig.preemptState === 'PREEMPTING'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      }`}
                    >
                      {sig.preemptState === 'HOLD_GREEN'
                        ? `HOLD GREEN (${signalTimers[sig.name] ?? sig.holdDurationSeconds}s)`
                        : sig.preemptState}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Route Comparison Card & Actions */}
          <div className="lg:col-span-4 space-y-4">
            {/* Speed & Comparison Card */}
            <div className="p-5 bg-[#0B1B4F] border border-[#1E3A8A] rounded-2xl shadow-xl space-y-4 text-white">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Performance Benchmark</span>
              </h3>

              <div className="space-y-3 text-xs">
                {/* Regular Route */}
                <div className="p-3 bg-red-950/40 rounded-xl border border-red-500/30">
                  <div className="flex items-center justify-between font-bold text-red-200 mb-1">
                    <span>Standard Unmanaged Route</span>
                    <span className="font-mono text-sm text-red-300">{activePreset.standardDurationMins} mins</span>
                  </div>
                  <p className="text-[11px] text-red-300">Subject to peak city traffic lights and red signal queues.</p>
                </div>

                {/* ResQGrid Green Wave */}
                <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30 shadow-xs">
                  <div className="flex items-center justify-between font-extrabold text-emerald-200 mb-1">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      ResQGrid Green Wave
                    </span>
                    <span className="font-mono text-sm text-emerald-300">{activePreset.preemptedDurationMins} mins</span>
                  </div>
                  <p className="text-[11px] text-emerald-200 font-semibold">
                    Dynamic signal preemption clears all traffic lights ahead of ambulance arrival.
                  </p>
                </div>
              </div>

              {/* Interactive Preemption Toggle */}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Live Wave Simulation:</span>
                <button
                  onClick={() => setIsPreemptionActive(!isPreemptionActive)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    isPreemptionActive
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'bg-white/10 border border-white/15 text-slate-300'
                  }`}
                >
                  {isPreemptionActive ? <Play className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                  <span>{isPreemptionActive ? 'Active (Live)' : 'Paused'}</span>
                </button>
              </div>
            </div>

            {/* Quick Navigation Button */}
            <Button
              variant="danger"
              fullWidth
              onClick={() => navigate('/dispatcher/traffic')}
              className="py-3 shadow-lg shadow-red-600/30"
            >
              View Road Congestion Telemetry
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default RouteIntelligence;
