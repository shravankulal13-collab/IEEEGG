// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Master Dispatcher Sidebar Navigation
// ============================================================

import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Activity,
  AlertOctagon,
  Truck,
  BarChart3,
  FileText,
  Bell,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const [collapsed, setCollapsed] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  return (
    <aside
      className={`flex flex-col bg-[#050B24] text-slate-200 border-r border-blue-900/40 transition-all duration-300 ease-in-out select-none z-30 shrink-0 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header: 3 Dots + ResQGrid + Emergency Operations Platform */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-blue-900/30 bg-[#050B24]">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Three dots: cyan, white, red */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_6px_#ffffff]" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF1F2D] shadow-[0_0_8px_#ff1f2d]" />
          </div>

          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="text-xl font-extrabold tracking-tight text-white font-display flex items-center">
                ResQ<span className="text-[#FF1F2D] drop-shadow-[0_0_8px_rgba(255,31,45,0.6)]">Grid</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wide truncate">
                Emergency Operations Platform
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle (desktop only) */}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-blue-900/30 transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links with Subtitles */}
      <nav className="flex-1 py-4 px-3 space-y-2 overflow-y-auto">
        {[
          {
            to: '/dispatcher',
            end: true,
            label: 'Command Center',
            sub: 'Live Operations',
            icon: Activity,
            badge: null,
          },
          {
            to: '/dispatcher/incidents',
            label: 'Incident Queue',
            sub: 'Manage Incidents',
            icon: AlertOctagon,
            badge: 12,
          },
          {
            to: '/dispatcher/fleet',
            label: 'Ambulance Fleet',
            sub: 'Track & Coordinate',
            icon: Truck,
            badge: null,
          },
          {
            to: '/dispatcher/analytics',
            label: 'Operational Analytics',
            sub: 'Insights & Reports',
            icon: BarChart3,
            badge: null,
          },
          {
            to: '/dispatcher/audit',
            label: 'Audit & Compliance',
            sub: 'System Logs',
            icon: FileText,
            badge: null,
          },
          {
            to: '/dispatcher/notifications',
            label: 'Alert Stream',
            sub: 'Real-time Notifications',
            icon: Bell,
            badge: unreadCount > 0 ? unreadCount : 3,
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              title={collapsed ? `${item.label} — ${item.sub}` : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3 py-2.5 rounded-xl font-medium text-xs md:text-sm transition-all duration-180 group relative select-none ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-[0_0_20px_rgba(37,99,235,0.45)]'
                    : 'text-slate-400 hover:bg-[#07133A] hover:text-slate-100'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-180 ${
                      isActive
                        ? 'text-white'
                        : 'text-cyan-400 group-hover:text-cyan-300'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  {!collapsed && (
                    <div className="flex flex-col truncate flex-1 leading-tight">
                      <span className={`text-xs font-bold tracking-tight truncate ${isActive ? 'text-white' : 'text-slate-200 group-hover:text-white'}`}>
                        {item.label}
                      </span>
                      <span className={`text-[10px] truncate ${isActive ? 'text-blue-100/90' : 'text-slate-400'}`}>
                        {item.sub}
                      </span>
                    </div>
                  )}

                  {!collapsed && item.badge && (
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-[#FF1F2D] text-white shrink-0 shadow-[0_0_10px_rgba(255,31,45,0.6)]">
                      {item.badge}
                    </span>
                  )}

                  {collapsed && item.badge && (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-[#FF1F2D] ring-2 ring-[#050B24] shadow-[0_0_6px_rgba(255,31,45,0.7)]" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom Emergency Cross & Branding Footer */}
      <div className="p-4 border-t border-blue-900/30 bg-[#050B24] space-y-3">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full border-2 border-[#FF1F2D] flex items-center justify-center text-[#FF1F2D] shadow-[0_0_10px_rgba(255,31,45,0.4)] shrink-0">
              <span className="text-base font-bold leading-none">+</span>
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-bold text-white tracking-wide leading-tight">
                Together
              </span>
              <span className="text-[10px] text-slate-400 leading-tight">
                for Safer Communities
              </span>
            </div>
          </div>
        )}

        {!collapsed && (
          <div className="pt-2 border-t border-blue-900/20 text-[10px] text-slate-400 space-y-0.5">
            <div className="font-semibold text-slate-400">ResQGrid v1.0.0</div>
            <div className="text-slate-400">Smart Response. Stronger Tomorrow.</div>
          </div>
        )}

        {/* Keep links to citizen and ambulance portals */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <a
            href="/citizen"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            {!collapsed && <span>Citizen</span>}
          </a>
          <a
            href="/ambulance"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400 transition-colors flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            {!collapsed && <span>Ambulance</span>}
          </a>
        </div>
      </div>
    </aside>
  );
};
