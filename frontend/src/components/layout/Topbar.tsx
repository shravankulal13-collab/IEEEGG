// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Master Dispatcher Header & Operational Topbar
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Menu,
  Bell,
} from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

interface TopbarProps {
  onOpenMobile?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobile }) => {
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();
  const [timeString, setTimeString] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  // Live operational UTC & Local clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-[#050B24] border-b border-blue-900/40 px-4 md:px-6 flex items-center justify-between sticky top-0 z-20">
      {/* Left Area: Mobile Menu + Wide Search Input with Ctrl K */}
      <div className="flex items-center gap-3 md:gap-4 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-lg text-slate-400 hover:bg-[#07133A] hover:text-white transition-colors"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1 max-w-md hidden sm:block">
          <div className="flex items-center w-full px-3 py-1.5 rounded-xl bg-[#07133A]/80 border border-blue-900/50 text-xs text-slate-200 focus-within:border-cyan-400 focus-within:ring-1 focus-within:ring-cyan-400 transition-all shadow-inner">
            <span className="text-slate-400 mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search incidents, locations, ambulances..."
              className="bg-transparent border-none outline-none w-full text-xs text-slate-200 placeholder-slate-500"
            />
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#050B24] border border-blue-800/60 text-slate-400 shrink-0 ml-1">
              Ctrl K
            </span>
          </div>
        </div>
      </div>

      {/* Right Area: LIVE pill + Clock & Date + Notifications + Profile */}
      <div className="flex items-center gap-3.5 md:gap-5 shrink-0">
        {/* Live Pill */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-600/50 text-emerald-400 text-xs font-bold shadow-[0_0_10px_rgba(16,185,129,0.2)] select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_#34d399]" />
          <span>LIVE</span>
        </div>

        {/* Date & Time */}
        <div className="hidden md:flex flex-col text-right select-none">
          <span className="text-xs font-bold text-white font-mono tracking-tight leading-tight">
            {timeString || '02:07:39'} IST
          </span>
          <span className="text-[10px] text-slate-400 leading-tight">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* Notification Bell with Badge 3 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-full bg-[#07133A] border border-blue-900/40 flex items-center justify-center text-slate-300 hover:text-white hover:border-cyan-400 transition-colors relative"
            aria-label="Open notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF1F2D] text-[10px] font-bold text-white flex items-center justify-center shadow-[0_0_8px_rgba(255,31,45,0.7)]">
              {unreadCount > 0 ? unreadCount : 3}
            </span>
          </button>

          {/* Quick Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#07133A] border border-blue-900/50 shadow-2xl py-3 z-50 animate-in fade-in-50 slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-blue-900/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Active System Alerts
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-red-950 text-red-400 border border-red-800 text-[10px] font-bold">
                    3 new
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => markAllAsRead()}
                  className="text-[11px] font-medium text-cyan-400 hover:underline"
                >
                  Mark all read
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-blue-900/30">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No active emergency alerts recorded.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      className={`p-3 text-xs transition-colors hover:bg-blue-950/40 ${
                        !n.is_read ? 'bg-blue-900/20 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-slate-100">{n.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {new Date(n.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-400 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-2.5 px-4 border-t border-blue-900/40 text-center">
                <a
                  href="/dispatcher/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  View complete notification log →
                </a>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Button matching screenshot: OP | Dispatcher 01 Online ▾ */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#07133A]/80 border border-blue-900/40 select-none cursor-pointer hover:border-blue-700 transition-colors">
          <div className="w-7 h-7 rounded-full bg-[#050B24] border border-blue-500/40 text-cyan-400 flex items-center justify-center font-bold text-xs">
            OP
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-white leading-tight">
              Dispatcher 01
            </span>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1 leading-tight">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block shadow-[0_0_4px_#34d399]" />
              Online
            </span>
          </div>
          <span className="text-slate-400 text-xs ml-1">▾</span>
        </div>
      </div>
    </header>
  );
};
