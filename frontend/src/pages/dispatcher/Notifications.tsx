// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Dispatcher Alerts & Emergency Broadcast Manager
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/layout/PageHeader';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Bell, Siren, RefreshCw, Send, CheckCircle2 } from 'lucide-react';

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [broadcastText, setBroadcastText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const notifications = [
    {
      id: 'N-1',
      title: 'High-Priority Cardiac Dispatch Alert',
      desc: 'AMB-104 dispatched to Incident ER-2048 with Cath-Lab reservation.',
      time: '3 mins ago',
      type: 'critical',
    },
    {
      id: 'N-2',
      title: 'Green Signal Corridor Engaged',
      desc: 'Traffic signals 4A/4B preempted for emergency vehicle transit.',
      time: '6 mins ago',
      type: 'info',
    },
    {
      id: 'N-3',
      title: 'St. Jude Memorial ICU Update',
      desc: '18 ICU beds free and ready for incoming emergency admissions.',
      time: '14 mins ago',
      type: 'success',
    },
  ];

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastText) return;
    setSentSuccess(true);
    setTimeout(() => {
      setBroadcastText('');
      setSentSuccess(false);
    }, 3000);
  };

  return (
    <AppShell sidebarVariant="top">
      <PageHeader
        title="Emergency Alerts & Broadcast Console"
        subtitle="Real-time multi-agency notifications, radio dispatch audio alerts, and municipal broadcasts"

        actions={
          <Button variant="outline" size="sm" onClick={() => navigate('/dispatcher')}>

            Command Center
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Feed of Real-time Notifications */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">

              <span>Priority Notification Feed</span>
            </h3>
            <span className="text-xs text-slate-500">Auto-updating</span>
          </div>

          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex items-start gap-3.5 hover-lift"
            >

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{notif.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Broadcast Alert Launcher */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Send Municipal Broadcast Alert</h3>
          <p className="text-xs text-slate-500 mb-4">
            Push instant emergency notifications to all on-duty drivers, hospital intake staff, and citizen devices.
          </p>

          {sentSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs font-semibold text-emerald-800">

              <span>Broadcast dispatched to all connected WebSocket clients!</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            <textarea
              rows={4}
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="e.g. Flash Flood Alert: Avoid Low-Lying Underpasses in Sector 4..."
              className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 bg-white"
            />

            <Button variant="danger" fullWidth type="submit">

              Publish Priority Broadcast
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
};
