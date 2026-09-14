// ============================================================
// PRIMARY OWNER: Shreevarsha V Hegde
// ROLE: Hospital + Dispatch Operations
// MODULE: Live Incoming Emergency Telemetry Stream
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import {
  HeartPulse,
  Phone,
  ShieldCheck,
  ArrowLeft,
} from 'lucide-react';

export const IncomingEmergency: React.FC = () => {
  const navigate = useNavigate();
  const [cathLabReady, setCathLabReady] = useState(true);

  return (
    <AppShell>
      <PageHeader
        pillTag="DEMO / SIMULATION Trauma Inbound Stream"
        title="Live Inbound Patient Telemetry [SIMULATION]"
        subtitle="Simulated cardiac waveform, oxygen saturation, and paramedic telemetry stream"
        badge={<Badge variant="danger">Simulation Inbound</Badge>}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/hospital')}
            className="border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Intake Dashboard
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        {/* Left: Live Vitals Monitor */}
        <div className="lg:col-span-8 bg-slate-950 text-white rounded-3xl p-6 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-600/20 text-red-500 flex items-center justify-center font-bold">
                <HeartPulse className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Live Onboard ECG & Biometrics</h3>
                <p className="text-xs text-slate-400">Streamed from AMB-104 via Socket.IO Real-time Mesh</p>
              </div>
            </div>
            <span className="px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-xs font-mono font-bold">
              SIGNAL SYNC 99.8%
            </span>
          </div>

          {/* 4 Biometric Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">HEART RATE</span>
              <span className="text-3xl font-black text-red-500">142</span>
              <span className="text-xs text-slate-400 ml-1">bpm (Tachycardia)</span>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">OXYGEN SpO2</span>
              <span className="text-3xl font-black text-amber-400">89%</span>
              <span className="text-xs text-slate-400 ml-1">(On 15L O2)</span>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">BLOOD PRESSURE</span>
              <span className="text-3xl font-black text-blue-400">85/55</span>
              <span className="text-xs text-slate-400 ml-1">mmHg</span>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">GLASGOW COMA (GCS)</span>
              <span className="text-3xl font-black text-purple-400">E3V4M5</span>
              <span className="text-xs text-slate-400 ml-1">Score: 12</span>
            </div>
          </div>

          {/* Simulated Waveform Canvas */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 relative h-32 flex items-center justify-center overflow-hidden">
            <svg className="w-full h-full text-emerald-500">
              <path
                d="M 0 60 L 80 60 L 95 10 L 110 110 L 125 60 L 190 60 L 205 10 L 220 110 L 235 60 L 300 60 L 315 10 L 330 110 L 345 60 L 410 60 L 425 10 L 440 110 L 455 60 L 520 60 L 535 10 L 550 110 L 565 60 L 630 60 L 645 10 L 660 110 L 675 60 L 740 60 L 755 10 L 770 110 L 785 60 L 850 60"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-pulse"
              />
            </svg>
          </div>
        </div>

        {/* Right: Hospital Trauma Team Readiness Controls */}
        <div className="lg:col-span-4 space-y-6">
          <Card>
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">Trauma Team Preparation</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-800">Cath-Lab Theater #2</span>
                <Badge variant="success">CLEARED & READY</Badge>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-800">Interventional Cardiologist</span>
                <span className="font-bold text-blue-600">Dr. Ramesh Rao</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="font-bold text-slate-800">Blood Bank (O Negative)</span>
                <span className="font-bold text-emerald-600">4 Units Prepared</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
              <Button
                variant={cathLabReady ? 'danger' : 'primary'}
                fullWidth
                size="sm"
                onClick={() => setCathLabReady(!cathLabReady)}
              >
                <ShieldCheck className="w-4 h-4 mr-1.5" />
                {cathLabReady ? 'Cath-Lab Team Standing By (Confirmed)' : 'Confirm Team Ready'}
              </Button>

              <Button
                variant="outline"
                fullWidth
                size="sm"
                onClick={() => alert('Audio patch established with AMB-104 Paramedic Unit.')}
              >
                <Phone className="w-4 h-4 mr-1.5" />
                Patch Paramedic Audio Call
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
};

export default IncomingEmergency;
