// ============================================================
// PRIMARY OWNER: khushi.shettyyy
// ROLE: Command Center + Realtime + Operational Intelligence
// MODULE: Mobile Navigation Drawer
// ============================================================

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  X,
  Radio,
  Activity,
  AlertOctagon,
  Truck,
  BarChart3,
  FileText,
  Bell,
  ExternalLink,
} from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';

interface MobileNavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({ isOpen, onClose }) => {
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  if (!isOpen) return null;

  const navItems = [
    { to: '/dispatcher', end: true, label: 'Command Center', icon: Activity },
    { to: '/dispatcher/incidents', label: 'Incident Queue', icon: AlertOctagon },
    { to: '/dispatcher/fleet', label: 'Ambulance Fleet', icon: Truck },
    { to: '/dispatcher/analytics', label: 'Operational Analytics', icon: BarChart3 },
    { to: '/dispatcher/audit', label: 'Audit & Compliance', icon: FileText },
    {
      to: '/dispatcher/notifications',
      label: 'Alert Stream',
      icon: Bell,
      badge: unreadCount > 0 ? unreadCount : null,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#07133A] text-white shadow-2xl z-10 border-r border-blue-900/40">
        <div className="h-16 flex items-center justify-between px-4 border-b border-blue-900/30 bg-[#050B24]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight font-display text-white">
              IEEGG COMMAND
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-950/40"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium text-sm transition-colors ${
                    isActive
                      ? 'bg-[#2563EB] text-white font-semibold shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                      : 'text-slate-400 hover:bg-[#0B1B4A] hover:text-white'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#FF1F2D] text-white shadow-[0_0_8px_rgba(255,31,45,0.5)]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>

        <div className="p-4 border-t border-blue-900/30 bg-[#050B24]/80 space-y-2">
          <a
            href="/citizen"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 py-1"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Citizen Portal
          </a>
          <a
            href="/ambulance"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs text-slate-400 hover:text-cyan-400 py-1"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Ambulance Driver Portal
          </a>
        </div>
      </div>
    </div>
  );
};
