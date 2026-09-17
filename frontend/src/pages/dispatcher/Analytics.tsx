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
          <Button variant="outline" size="sm" onClick={() => navigate('/dispatcher')}>

            Command Center
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Average Response Time</span>

          </div>
          <span className="text-3xl font-black text-slate-900">7.2 min</span>
          <p className="text-xs text-emerald-600 font-bold mt-1">1.4 min faster than baseline (Optimized)</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Sub-Second Dispatch</span>

          </div>
          <span className="text-3xl font-black text-slate-900">328 ms</span>
          <p className="text-xs text-purple-600 font-bold mt-1">Multi-Criteria Proximity Engine</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Cardiac Survival Index</span>

          </div>
          <span className="text-3xl font-black text-slate-900">92.4%</span>
          <p className="text-xs text-emerald-600 font-bold mt-1">+8.6% improvement with pre-triage</p>
        </Card>

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Anti-Hoax Accuracy</span>

          </div>
          <span className="text-3xl font-black text-slate-900">99.8%</span>
          <p className="text-xs text-slate-500 font-bold mt-1">Validated across 1,400+ runs</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-sm font-extrabold text-slate-900 mb-4">Emergency Incident Types Breakdown</h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Cardiac & Stroke (Critical ALS)</span>
                <span className="text-red-600 font-extrabold">38%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-red-600 rounded-full" style={{ width: '38%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Trauma & Collisions</span>
                <span className="text-amber-600 font-extrabold">29%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '29%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Respiratory & Severe Infection</span>
                <span className="text-blue-600 font-extrabold">21%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: '21%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-bold mb-1">
                <span>Pediatric & Urgent Clinic</span>
                <span className="text-purple-600 font-extrabold">12%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-purple-600 rounded-full" style={{ width: '12%' }} />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-extrabold text-slate-900 mb-4">Municipal Emergency Corridors Performance</h3>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">Sector 4 (Central Medical Express)</span>
                <p className="text-slate-500 text-[11px]">Signal preemption active</p>
              </div>
              <span className="text-emerald-600 font-black">5.8 min avg</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">Sector 9 (Highway North Bypass)</span>
                <p className="text-slate-500 text-[11px]">Green wave clearance</p>
              </div>
              <span className="text-emerald-600 font-black">6.4 min avg</span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900">Sector 12 (Suburban East)</span>
                <p className="text-slate-500 text-[11px]">Direct clinic diversion</p>
              </div>
              <span className="text-blue-600 font-black">7.9 min avg</span>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
};

export default Analytics;
