// ============================================================
// PRIMARY OWNER: Saishree Santhosh Shet
// ROLE: Citizen + Ambulance Application
// MODULE: Ambulance Vehicle Readiness & Telemetry Diagnostics
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  Radio,
  BatteryCharging,
  ArrowLeft
} from 'lucide-react';

export const VehicleStatus: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppShell sidebarVariant='top'>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <PageHeader
          title="Vehicle Diagnostics & Readiness: AMB-104"
          subtitle="Real-time sensor telemetry, medical oxygen capacity, and cardiac life support readiness"
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ambulance')}
              className="border-white/20 text-slate-200 hover:bg-white/10"
            >
              Back to Dashboard
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GPS & Network Telemetry */}
          <div className="p-6 border border-[#1E3A8A] bg-[#0B1B4F] rounded-2xl shadow-xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-sky-400 font-black text-sm uppercase">
                <Radio className="w-5 h-5 animate-pulse" />
                Live GPS & Telemetry Network
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                CONNECTED
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 font-semibold">Cellular Telemetry Signal:</span>
                <span className="font-extrabold text-emerald-400">-65 dBm (5G Ultra)</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 font-semibold">Satellite GPS Precision:</span>
                <span className="font-extrabold text-white">3.2 meters</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 font-semibold">Lat / Lng Coordinates:</span>
                <span className="font-mono text-sky-300 font-bold">12.9716° N, 77.5946° E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">Telemetry Packet Frequency:</span>
                <span className="font-extrabold text-white">1000 ms (Realtime)</span>
              </div>
            </div>
          </div>

          {/* Medical Equipment Readiness */}
          <div className="p-6 border border-[#1E3A8A] bg-[#0B1B4F] rounded-2xl shadow-xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase">
                <BatteryCharging className="w-5 h-5" />
                Medical Life Support Equipment
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold border border-sky-500/30">
                CALIBRATED
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 font-semibold">Medical O2 Tank Pressure:</span>
                <span className="font-extrabold text-sky-400">2,000 PSI (98% Full)</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 font-semibold">Defibrillator Capacitor:</span>
                <span className="font-extrabold text-emerald-400">Charged (360 Joules)</span>
              </div>
              <div className="flex justify-between border-b border-white/10 pb-2">
                <span className="text-slate-300 font-semibold">Suction & Ventilator:</span>
                <span className="font-extrabold text-emerald-400">OPERATIONAL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-300 font-semibold">Vehicle Alternator / Battery:</span>
                <span className="font-extrabold text-white">14.2 V (Normal)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};

export default VehicleStatus;
