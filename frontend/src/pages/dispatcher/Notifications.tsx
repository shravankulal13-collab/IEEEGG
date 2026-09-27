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
          <Button variant="outline" size="sm" onClick={() => navigate('/dispatcher')} className="border-white/20 text-white hover:bg-white/10">
            Command Center
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Feed of Real-time Notifications */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-sky-400" />
              <span>Priority Notification Feed</span>
            </h3>
            <span className="text-xs text-slate-400">Auto-updating</span>
          </div>

          {notifications.map((notif) => (
            <div
              key={notif.id}
              className="p-4 bg-[#0B1B4F] rounded-2xl border border-[#1E3A8A] shadow-xl flex items-start gap-3.5 hover-lift text-white"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white">{notif.title}</h4>
                  <span className="text-[10px] text-slate-400 font-mono">{notif.time}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{notif.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Broadcast Alert Launcher */}
        <div className="lg:col-span-5 bg-[#0B1B4F] rounded-3xl p-6 border border-[#1E3A8A] shadow-xl text-white">
          <div className="flex items-center gap-2 mb-2">
            <Siren className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-white">Send Municipal Broadcast Alert</h3>
          </div>
          <p className="text-xs text-slate-300 mb-4">
            Push instant emergency notifications to all on-duty drivers, hospital intake staff, and citizen devices.
          </p>

          {sentSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Emergency alert broadcast dispatched successfully across all channels!</span>
            </div>
          )}

          <form onSubmit={handleBroadcast} className="space-y-4">
            <textarea
              rows={4}
              value={broadcastText}
              onChange={(e) => setBroadcastText(e.target.value)}
              placeholder="e.g. Flash Flood Alert: Avoid Low-Lying Underpasses in Sector 4..."
              className="w-full p-3 text-xs border border-white/15 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-900/80 text-white placeholder:text-slate-400"
            />

            <Button variant="danger" fullWidth type="submit">
              <Send className="w-4 h-4 mr-1.5" />
              Publish Priority Broadcast
            </Button>
          </form>
        </div>
      </div>
    </AppShell>
  );
};
