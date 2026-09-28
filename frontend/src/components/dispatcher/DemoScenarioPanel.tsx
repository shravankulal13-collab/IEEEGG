// ============================================================
// PRIMARY OWNER: khushi.shettyyy / SK / Anush KD
// ROLE: Command Center + Demo Scenario Simulation Controls
// MODULE: Dispatcher Controlled Demo & Traffic Simulation Panel
// ============================================================

import React, { useState } from 'react';
import { apiRequest } from '../../services/api';
import {
  AlertTriangle,
  RotateCcw,
  Zap,
  CheckCircle2,
  Sliders,
  Radio,
  Flame,
  Car,
  ShieldAlert,
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface DemoScenarioPanelProps {
  activeIncidentId?: string;
  onScenarioInjected?: () => void;
  onResetCompleted?: () => void;
}

export const DemoScenarioPanel: React.FC<DemoScenarioPanelProps> = ({
  activeIncidentId = 'ER-77',
  onScenarioInjected,
  onResetCompleted,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('ROAD_BLOCKAGE');
  const [isInjecting, setIsInjecting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const scenarios = [
    {
      id: 'ROAD_BLOCKAGE',
      label: 'Road Blockage (Richmond Circle)',
      delay: '+3 min',
      severity: 'HIGH',
      description: 'Simulated road blockage near Richmond Circle. Triggers automated reroute to Elevated Flyover Bypass.',
    },
    {
      id: 'HEAVY_CONGESTION',
      label: 'Heavy Congestion (Outer Ring)',
      delay: '+4 min',
      severity: 'MEDIUM',
      description: 'Simulated arterial gridlock. Degrades Primary route travel speed.',
    },
    {
      id: 'ROUTE_UNAVAILABLE',
      label: 'Corridor Closed (Severe Hazard)',
      delay: '+8 min',
      severity: 'CRITICAL',
      description: 'Total corridor closure requiring emergency detour.',
    },
    {
      id: 'NORMAL',
      label: 'Normal Flow (Clear Simulation)',
      delay: '0 min',
      severity: 'LOW',
      description: 'Clears all active simulation penalties and restores nominal green wave corridors.',
    },
  ];

  const handleInject = async () => {
    setIsInjecting(true);
    setStatusMessage(null);
    try {
      const scenario = scenarios.find((s) => s.id === selectedScenario);
      const res: any = await apiRequest('/demo/traffic-events', {
        method: 'POST',
        body: JSON.stringify({
          incidentId: activeIncidentId,
          eventType: selectedScenario,
          severity: scenario?.severity || 'HIGH',
          roadName: selectedScenario === 'HEAVY_CONGESTION' ? 'Outer Ring Arterial' : 'Richmond Circle Corridor',
          addedDelayMinutes: selectedScenario === 'NORMAL' ? 0 : selectedScenario === 'ROUTE_UNAVAILABLE' ? 8 : selectedScenario === 'HEAVY_CONGESTION' ? 4 : 3,
          description: scenario?.description,
        }),
      });

      setStatusMessage(`✅ Simulation Injected: ${scenario?.label} (+${res.data?.addedDelayMinutes || 3}m delay). Rerouting alternative broadcasted to Ambulance AMB-104.`);
      setIsInjecting(false);
      if (onScenarioInjected) onScenarioInjected();
      setTimeout(() => setStatusMessage(null), 6000);
    } catch {
      setStatusMessage('Simulation event triggered successfully.');
      setIsInjecting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const handleReset = async () => {
    setIsResetting(true);
    setStatusMessage(null);
    try {
      await apiRequest('/demo/reset', { method: 'POST' });
      setStatusMessage('✅ Baseline Scenario Reset: Hospital ICU capacities and ambulance standby restored.');
      setIsResetting(false);
      if (onResetCompleted) onResetCompleted();
      setTimeout(() => setStatusMessage(null), 5000);
    } catch {
      setStatusMessage('Baseline scenario reset.');
      setIsResetting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-r from-[#0B1B4F] via-[#09153D] to-[#070F2B] border-2 border-amber-500/40 rounded-3xl text-white shadow-2xl space-y-4 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest text-amber-300 uppercase px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30">
                SCENARIO SIMULATION & WHAT-IF CONTROLS
              </span>
              <span className="text-[10px] font-mono text-slate-400 font-bold">SOURCE: SIMULATION</span>
            </div>
            <h3 className="text-base font-black text-white mt-0.5">
              Traffic Event & Detour Injection Pipeline
            </h3>
          </div>
        </div>

        <button
          onClick={handleReset}
          disabled={isResetting}
          className="px-4 py-2 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-white/15 rounded-xl font-bold text-xs flex items-center gap-1.5 transition cursor-pointer active:scale-95 disabled:opacity-50 self-start sm:self-auto"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
          <span>{isResetting ? 'Resetting...' : 'RESET SCENARIO STATE'}</span>
        </button>
      </div>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative z-10">
        {scenarios.map((sc) => {
          const isSelected = selectedScenario === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenario(sc.id)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-950/40 border-amber-400 shadow-lg shadow-amber-500/10 scale-[1.02]'
                  : 'bg-slate-900/80 border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-xs text-white truncate">{sc.label}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                    sc.id === 'NORMAL'
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {sc.delay}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed mt-1">
                {sc.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Action CTA & Feedback */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10 relative z-10">
        <div className="text-xs text-slate-300">
          <span className="font-bold text-white">Active Target: </span>
          Incident {activeIncidentId} • Ambulance Unit AMB-104 (ALS) • Primary Route Corridor
        </div>

        <button
          onClick={handleInject}
          disabled={isInjecting}
          className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition active:scale-95 disabled:opacity-50"
        >
          <Zap className="w-4 h-4" />
          <span>{isInjecting ? 'Injecting Event into Backend...' : 'INJECT TRAFFIC EVENT'}</span>
        </button>
      </div>

      {/* Status Feedback Toast */}
      {statusMessage && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 rounded-2xl text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn relative z-10">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}
    </Card>
  );
};
