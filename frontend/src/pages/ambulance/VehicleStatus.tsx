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
    <AppShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        <PageHeader
          title="Vehicle Diagnostics & Readiness: AMB-104"
          subtitle="Real-time sensor telemetry, medical oxygen capacity, and cardiac life support readiness"
          badge={<Badge variant="success">SYSTEMS NOMINAL</Badge>}
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ambulance')}
              className="border-slate-300 text-slate-700 hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Cockpit
            </Button>
          }
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GPS & Network Telemetry */}
          <Card className="p-6 border border-slate-200 bg-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-blue-600 font-black text-sm uppercase">
                <Radio className="w-5 h-5" />
                MapMyIndia GPS & Network
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold">
                CONNECTED
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Cellular Telemetry Signal:</span>
                <span className="font-extrabold text-emerald-600">-65 dBm (5G Ultra)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">MapMyIndia GPS Accuracy:</span>
                <span className="font-extrabold text-slate-900">3.2 meters</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Lat / Lng Coordinates:</span>
                <span className="font-mono text-blue-600 font-bold">12.9716° N, 77.5946° E</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Telemetry Packet Frequency:</span>
                <span className="font-extrabold text-slate-900">1000 ms (Realtime)</span>
              </div>
            </div>
          </Card>

          {/* Medical Equipment Readiness */}
          <Card className="p-6 border border-slate-200 bg-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-emerald-600 font-black text-sm uppercase">
                <BatteryCharging className="w-5 h-5" />
                Medical Life Support Equipment
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-bold">
                CALIBRATED
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Medical O2 Tank Pressure:</span>
                <span className="font-extrabold text-blue-600">2,000 PSI (98% Full)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Defibrillator Capacitor:</span>
                <span className="font-extrabold text-emerald-600">Charged (360 Joules)</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500 font-semibold">Suction & Ventilator:</span>
                <span className="font-extrabold text-emerald-600">OPERATIONAL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-semibold">Vehicle Alternator / Battery:</span>
                <span className="font-extrabold text-slate-900">14.2 V (Normal)</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default VehicleStatus;
