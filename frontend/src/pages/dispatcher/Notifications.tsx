// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Real-Time Operational Alert Feed (/dispatcher/notifications)
// ============================================================

import React, { useState } from 'react';
import {
  Bell,
  Radio,
  Clock,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { EmptyState } from '../../components/ui/EmptyState';

export const Notifications: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } =
    useNotificationStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'unread') return !n.is_read;
    return true;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#07133A]/90 p-4 rounded-2xl border border-blue-900/30 backdrop-blur-md shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-lg font-bold text-white font-display flex items-center gap-2 tracking-tight">
              <Bell className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" /> Real-Time Operational Alert Feed
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Socket-delivered operational notifications, escalation events, and priority dispatches
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800/40 transition-colors shadow-[0_0_10px_rgba(6,182,212,0.15)]"
            >
              <CheckCheck className="w-4 h-4 text-cyan-400" />
              <span>Mark All Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/40 border border-blue-900/30 transition-colors"
              title="Clear Notification Feed"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            filter === 'all'
              ? 'bg-[#2563EB] text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] border border-blue-500/50'
              : 'bg-[#07133A]/70 text-slate-400 border border-blue-900/30 hover:text-slate-200 hover:bg-[#07133A]'
          }`}
        >
          All Alerts ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
            filter === 'unread'
              ? 'bg-[#2563EB] text-white shadow-[0_0_12px_rgba(37,99,235,0.4)] border border-blue-500/50'
              : 'bg-[#07133A]/70 text-slate-400 border border-blue-900/30 hover:text-slate-200 hover:bg-[#07133A]'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#FF1F2D] text-white text-[10px] font-bold shadow-[0_0_8px_rgba(255,31,45,0.6)]">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Alerts List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          title="No Alerts in Stream"
          description={
            filter === 'unread'
              ? 'All operational alerts have been marked as read.'
              : 'Real-time Socket.IO alerts and escalation broadcasts will automatically populate here as they occur.'
          }
          icon={Radio}
        />
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.is_read && markAsRead(n.id)}
              className={`group relative rounded-2xl border p-4 transition-all duration-200 cursor-pointer ${
                !n.is_read
                  ? 'bg-[#0B1B4A]/90 border-blue-500/40 shadow-[0_0_15px_rgba(37,99,235,0.15)]'
                  : 'bg-[#07133A]/60 border-blue-900/20 opacity-75 hover:opacity-100 hover:border-blue-800/40'
              }`}
            >
              {!n.is_read && (
                <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
              )}

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 border ${
                      !n.is_read
                        ? 'bg-blue-950/60 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
                        : 'bg-slate-900/60 text-slate-500 border-slate-800'
                    }`}
                  >
                    <Radio className="w-4 h-4" />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-white tracking-wide">{n.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-blue-950/70 border border-blue-800/40 text-cyan-300">
                        {n.notification_type || 'SYSTEM'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                      {n.message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 bg-[#050B24]/80 px-2 py-0.5 rounded border border-blue-950">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {new Date(n.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>

                  {!n.is_read && (
                    <span className="text-[10px] font-semibold text-cyan-400 hover:underline">
                      Mark read
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
