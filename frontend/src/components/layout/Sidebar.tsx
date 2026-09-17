// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Dynamic Portal-Aware Sidebar Navigation Component
// ============================================================

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {
  LayoutDashboard,
  Radio,
  Building2,
  Ambulance,
  Activity,
  MapPin,
  Settings,
  ShieldCheck,
  FileText,
  User,
  Zap,
  Flame,
  Layers,
  HeartPulse,
  Bell,
  Globe2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, switchDemoRole } = useAuthStore();

  // Detect current portal context from URL path
  const isDispatcher = location.pathname.startsWith('/dispatcher');
  const isHospital = location.pathname.startsWith('/hospital');
  const isAmbulance = location.pathname.startsWith('/ambulance');
  const isAdmin = location.pathname.startsWith('/admin');
  const isCitizen = location.pathname.startsWith('/citizen') || (!isDispatcher && !isHospital && !isAmbulance && !isAdmin);

  const getPortalInfo = () => {
    if (isDispatcher) {
      return {
        portalName: 'Dispatcher Hub',
        userRole: 'Emergency Dispatcher',
        userName: user?.fullName || 'Chief Dispatcher Sarah',
        avatarBg: 'bg-blue-600',
        badge: 'ACTIVE CONSOLE',
        badgeColor: 'bg-blue-100 text-blue-700 border-blue-200',
      };
    }
    if (isHospital) {
      return {
        portalName: 'Medical Unit',
        userRole: 'Medical Center Physician',
        userName: user?.fullName || 'Dr. Ramesh Rao (Medical Chief)',
        avatarBg: 'bg-emerald-600',
        badge: 'MEDICAL L1 READY',
        badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      };
    }
    if (isAmbulance) {
      return {
        portalName: 'Driver Cockpit',
        userRole: 'ALS Paramedic Driver',
        userName: user?.fullName || 'Paramedic Raj (Unit 742)',
        avatarBg: 'bg-red-600',
        badge: 'ON DUTY (ALS)',
        badgeColor: 'bg-red-100 text-red-700 border-red-200',
      };
    }
    if (isAdmin) {
      return {
        portalName: 'System Admin',
        userRole: 'Platform Administrator',
        userName: user?.fullName || 'System Operations Admin',
        avatarBg: 'bg-purple-600',
        badge: 'ROOT ACCESS',
        badgeColor: 'bg-purple-100 text-purple-700 border-purple-200',
      };
    }
    return {
      portalName: 'Citizen Portal',
      userRole: 'Emergency Patient / Citizen',
      userName: user?.fullName || 'Rahul Sharma (Citizen)',
      avatarBg: 'bg-red-600',
      badge: 'SOS READY',
      badgeColor: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
  };

  const portal = getPortalInfo();
  const publicLink = { label: 'Public', path: '/public', icon: <Globe2 className="w-4 h-4" /> };

  const getNavLinks = () => {
    if (isDispatcher) {
      return [
        publicLink,
        { label: 'Command Center', path: '/dispatcher', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Ambulance Fleet', path: '/dispatcher/fleet', icon: <Ambulance className="w-4 h-4" /> },
        { label: 'Hospital Network', path: '/dispatcher/hospitals', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Incident Dossier', path: '/dispatcher/incidents', icon: <FileText className="w-4 h-4" /> },
        { label: 'Green Corridors', path: '/dispatcher/routes', icon: <Zap className="w-4 h-4" /> },
        { label: 'Traffic Preemption', path: '/dispatcher/traffic', icon: <Activity className="w-4 h-4" /> },
        { label: 'Platform Analytics', path: '/dispatcher/analytics', icon: <Layers className="w-4 h-4" /> },
        { label: 'Audit Security Logs', path: '/dispatcher/audit', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'Dispatch Alerts', path: '/dispatcher/notifications', icon: <Bell className="w-4 h-4" /> },
      ];
    }

    if (isHospital) {
      return [
        publicLink,
        { label: 'Medical Intake Hub', path: '/hospital', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Live Inbound Telemetry', path: '/hospital/emergency', icon: <HeartPulse className="w-4 h-4" /> },
        { label: 'ICU & Bed Allocation', path: '/hospital/resources', icon: <Activity className="w-4 h-4" /> },
        { label: 'Specialist Doctors', path: '/hospital/doctors', icon: <User className="w-4 h-4" /> },
        { label: 'Patient History', path: '/hospital/history', icon: <FileText className="w-4 h-4" /> },
      ];
    }

    if (isAmbulance) {
      return [
        publicLink,
        { label: 'Driver Cockpit', path: '/ambulance', icon: <Ambulance className="w-4 h-4" /> },
        { label: 'Active Emergency', path: '/ambulance/active', icon: <Flame className="w-4 h-4" /> },
        { label: 'Dispatch Request', path: '/ambulance/dispatch', icon: <Zap className="w-4 h-4" /> },
        { label: 'Turn-by-Turn GPS', path: '/ambulance/navigation', icon: <MapPin className="w-4 h-4" /> },
        { label: 'Vehicle Readiness', path: '/ambulance/status', icon: <Activity className="w-4 h-4" /> },
        { label: 'Trip Response Logs', path: '/ambulance/history', icon: <FileText className="w-4 h-4" /> },
      ];
    }

    if (isAdmin) {
      return [
        publicLink,
        { label: 'System Diagnostics', path: '/admin', icon: <ShieldCheck className="w-4 h-4" /> },
        { label: 'Switch: Citizen Portal', path: '/citizen', icon: <Radio className="w-4 h-4" /> },
        { label: 'Switch: Dispatcher Hub', path: '/dispatcher', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Switch: Driver Cockpit', path: '/ambulance', icon: <Ambulance className="w-4 h-4" /> },
        { label: 'Switch: Hospital Grid', path: '/hospital', icon: <Building2 className="w-4 h-4" /> },
      ];
    }

    // Default: Citizen Portal
    return [
      publicLink,
      { label: 'Emergency SOS Home', path: '/citizen', icon: <Radio className="w-4 h-4" /> },
      { label: 'Report Incident Intake', path: '/citizen/report', icon: <Zap className="w-4 h-4" /> },
      { label: 'Live Incident Tracking', path: '/citizen/tracking', icon: <MapPin className="w-4 h-4" /> },
      { label: 'Incident History', path: '/citizen/history', icon: <FileText className="w-4 h-4" /> },
      { label: 'Medical ID Profile', path: '/citizen/profile', icon: <User className="w-4 h-4" /> },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-4 shrink-0 select-none shadow-sm">
      <div>
        {/* Active Role Card Header */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 mb-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${portal.avatarBg} text-white flex items-center justify-center font-bold text-base shadow-md`}>
              {isDispatcher ? (
                <LayoutDashboard className="w-5 h-5 text-white" />
              ) : isHospital ? (
                <Building2 className="w-5 h-5 text-white" />
              ) : isAmbulance ? (
                <Ambulance className="w-5 h-5 text-white" />
              ) : isAdmin ? (
                <ShieldCheck className="w-5 h-5 text-white" />
              ) : (
                <Radio className="w-5 h-5 text-white" />
              )}
            </div>
            <div className="overflow-hidden">
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${portal.badgeColor} inline-block mb-0.5`}>
                {portal.badge}
              </span>
              <p className="text-xs font-black text-slate-900 truncate">
                {portal.userName}
              </p>
              <p className="text-[10px] text-slate-500 font-semibold truncate">
                {portal.portalName}
              </p>
            </div>
          </div>
        </div>

        {/* Portal Navigation Items */}
        <div className="mb-2 px-1 text-[10px] font-black text-slate-400 uppercase tracking-wider">
          {portal.portalName} NAVIGATION
        </div>

        <nav className="space-y-1">
          {navLinks.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(`${item.path}/`));
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition-all text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-red-600 to-[#B80710] text-white shadow-lg shadow-red-600/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-slate-500'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Fast Switch Portals Quick Bar */}
      <div className="space-y-2 border-t border-slate-200 pt-3">
        <div className="px-1 text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>PORTAL SWITCHER</span>
          <span className="text-emerald-600 font-bold">1-Click</span>
        </div>

        <div className="grid grid-cols-2 gap-1.5">
          <button
            onClick={() => {
              const path = switchDemoRole('citizen');
              navigate(path);
            }}
            className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition text-left flex items-center gap-1.5 ${
              isCitizen ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5 shrink-0 text-red-500" />
            <span className="truncate">Citizen</span>
          </button>

          <button
            onClick={() => {
              const path = switchDemoRole('ambulance_driver');
              navigate(path);
            }}
            className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition text-left flex items-center gap-1.5 ${
              isAmbulance ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Ambulance className="w-3.5 h-3.5 shrink-0 text-blue-500" />
            <span className="truncate">Ambulance</span>
          </button>

          <button
            onClick={() => {
              const path = switchDemoRole('dispatcher');
              navigate(path);
            }}
            className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition text-left flex items-center gap-1.5 ${
              isDispatcher ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5 shrink-0 text-purple-500" />
            <span className="truncate">Dispatch</span>
          </button>

          <button
            onClick={() => {
              const path = switchDemoRole('hospital_admin');
              navigate(path);
            }}
            className={`px-2 py-1.5 rounded-lg text-[10px] font-black transition text-left flex items-center gap-1.5 ${
              isHospital ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            <span className="truncate">Hospital</span>
          </button>
        </div>

        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 font-semibold border-t border-slate-100">
          <button
            onClick={() => navigate('/')}
            className="hover:text-red-600 transition flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-red-500" />
            Home Showcase
          </button>
          <button
            onClick={() => navigate('/admin')}
            className="hover:text-blue-600 transition flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5 text-blue-500" />
            Diagnostics
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
