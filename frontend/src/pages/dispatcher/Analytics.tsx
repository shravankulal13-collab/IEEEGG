// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Incident & Response Analytics Dashboard
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Activity, Clock, ShieldCheck, HeartPulse, RefreshCw } from 'lucide-react';

export const Analytics: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AppShell sidebarVariant="top">
      <PageHeader

        title="Platform Operational Analytics & SLA"
        subtitle="Historical response latency, dispatch accuracy, survival index, and fleet efficiency"

        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/dispatcher')} className="border-white/20 text-white hover:bg-white/10">
            Command Center
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Average Response Time</span>
          </div>
          <span className="text-3xl font-black text-white">7.2 min</span>
          <p className="text-xs text-emerald-400 font-bold mt-1">1.4 min faster than baseline (Optimized)</p>
        </Card>

        <Card className="bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Sub-Second Dispatch</span>
          </div>
          <span className="text-3xl font-black text-white">328 ms</span>
          <p className="text-xs text-purple-400 font-bold mt-1">Multi-Criteria Proximity Engine</p>
        </Card>

        <Card className="bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Cardiac Survival Index</span>
          </div>
          <span className="text-3xl font-black text-white">92.4%</span>
          <p className="text-xs text-emerald-400 font-bold mt-1">+8.6% improvement with pre-triage</p>
        </Card>

        <Card className="bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300 uppercase">Anti-Hoax Accuracy</span>
          </div>
          <span className="text-3xl font-black text-white">99.8%</span>
          <p className="text-xs text-slate-300 font-bold mt-1">Validated across 1,400+ runs</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white p-6">
          <h3 className="text-sm font-extrabold text-white mb-4">Emergency Incident Types Breakdown</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-200">Cardiac & Stroke (Critical ALS)</span>
                <span className="text-rose-400 font-extrabold">38%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-white/10">
                <div className="h-full bg-rose-500 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-200">Medical Emergencies & Collisions</span>
                <span className="text-amber-400 font-extrabold">29%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-white/10">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '29%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-200">Respiratory & Severe Infection</span>
                <span className="text-sky-400 font-extrabold">21%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-white/10">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: '21%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span className="text-slate-200">Pediatric & Urgent Clinic</span>
                <span className="text-purple-400 font-extrabold">12%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-white/10">
                <div className="h-full bg-purple-500 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-[#0B1B4F] border border-[#1E3A8A] shadow-xl text-white p-6">
          <h3 className="text-sm font-extrabold text-white mb-4">Municipal Emergency Corridors Performance</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Sector 4 (Central Medical Express)</span>
                <p className="text-slate-300 text-[11px]">Signal preemption active</p>
              </div>
              <span className="text-emerald-400 font-black">5.8 min avg</span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Sector 9 (Highway North Bypass)</span>
                <p className="text-slate-300 text-[11px]">Green wave clearance</p>
              </div>
              <span className="text-emerald-400 font-black">6.4 min avg</span>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-white/10 flex items-center justify-between">
              <div>
                <span className="font-bold text-white">Sector 12 (Suburban East)</span>
                <p className="text-slate-300 text-[11px]">Direct clinic diversion</p>
              </div>
              <span className="text-sky-400 font-black">7.9 min avg</span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
};

export default Analytics;
