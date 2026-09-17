// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Landing Page Style Master Top Header Navigation
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { checkApiHealth, type ApiHealthResponse } from '../../services/api';
import { 
  FileText, 
  LogOut, 
  Radio, 
  ChevronDown, 
  Zap, 
  Ambulance, 
  LayoutDashboard, 
  Building2, 
  Menu, 
  X, 
  MapPin, 
  HeartPulse, 
  ArrowRight,
  Flame,
  User,
  History,
  ShieldCheck,
  Layers,
  Activity
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchHealth = async () => {
      const data = await checkApiHealth();
      if (isMounted) setHealth(data);
    };
    fetchHealth();
    const timer = setInterval(fetchHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileNavOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const userRole = user?.role || 'citizen';
  const isDispatcher = userRole === 'dispatcher';
  const isHospital = userRole === 'hospital_admin' || userRole === 'hospital_staff';
  const isAmbulance = userRole === 'ambulance_driver';
  const isAdmin = userRole === 'system_admin';
  const isCitizen = userRole === 'citizen' || (!isDispatcher && !isHospital && !isAmbulance && !isAdmin);

  // Role-Specific Navigation Links in Short, Understandable Words
  const getNavLinks = (): NavItem[] => {
    if (isDispatcher) {
      return [
        { label: 'Command Center', path: '/dispatcher', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Fleet', path: '/dispatcher/fleet', icon: <Ambulance className="w-4 h-4" /> },
        { label: 'Hospitals', path: '/dispatcher/hospitals', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Incidents', path: '/dispatcher/incidents', icon: <FileText className="w-4 h-4" /> },
        { label: 'Green Corridors', path: '/dispatcher/routes', icon: <Zap className="w-4 h-4" /> },
        { label: 'Traffic', path: '/dispatcher/traffic', icon: <Activity className="w-4 h-4" /> },
        { label: 'Analytics', path: '/dispatcher/analytics', icon: <Layers className="w-4 h-4" /> },
        { label: 'Audit Logs', path: '/dispatcher/audit', icon: <ShieldCheck className="w-4 h-4" /> },
      ];
    }

    if (isHospital) {
      return [
        { label: 'Trauma Hub', path: '/hospital', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Live Inbound', path: '/hospital/emergency', icon: <HeartPulse className="w-4 h-4" /> },
        { label: 'Beds & ICU', path: '/hospital/resources', icon: <Activity className="w-4 h-4" /> },
        { label: 'Doctors', path: '/hospital/doctors', icon: <User className="w-4 h-4" /> },
        { label: 'Patient History', path: '/hospital/history', icon: <FileText className="w-4 h-4" /> },
      ];
    }

    if (isAmbulance) {
      return [
        { label: 'Cockpit', path: '/ambulance', icon: <Ambulance className="w-4 h-4" /> },
        { label: 'Active SOS', path: '/ambulance/active', icon: <Flame className="w-4 h-4" /> },
        { label: 'Dispatches', path: '/ambulance/dispatch', icon: <Zap className="w-4 h-4" /> },
        { label: 'Turn-by-Turn', path: '/ambulance/navigation', icon: <MapPin className="w-4 h-4" /> },
        { label: 'Readiness', path: '/ambulance/status', icon: <Activity className="w-4 h-4" /> },
        { label: 'Trip Logs', path: '/ambulance/history', icon: <History className="w-4 h-4" /> },
      ];
    }

    if (isAdmin) {
      return [
        { label: 'Diagnostics', path: '/admin', icon: <Activity className="w-4 h-4" /> },
        { label: 'Citizen View', path: '/citizen', icon: <Radio className="w-4 h-4" /> },
        { label: 'Dispatch Hub', path: '/dispatcher', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Driver Cockpit', path: '/ambulance', icon: <Ambulance className="w-4 h-4" /> },
        { label: 'Hospital Grid', path: '/hospital', icon: <Building2 className="w-4 h-4" /> },
      ];
    }

    // Default: Citizen Portal
    return [
      { label: 'SOS Home', path: '/citizen', icon: <Radio className="w-4 h-4" /> },
      { label: 'Report Emergency', path: '/citizen/report', icon: <Zap className="w-4 h-4" /> },
      { label: 'Live Tracking', path: '/citizen/tracking', icon: <MapPin className="w-4 h-4" /> },
      { label: 'History', path: '/citizen/history', icon: <History className="w-4 h-4" /> },
    ];
  };

  const navLinks = getNavLinks();

  const getPortalBadge = () => {
    if (isDispatcher) return { label: 'Command Hub', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    if (isHospital) return { label: 'Trauma Network', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (isAmbulance) return { label: 'Driver Cockpit', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
    if (isAdmin) return { label: 'Diagnostics', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' };
    return { label: 'Citizen SOS', color: 'bg-red-500/20 text-red-300 border-red-500/30' };
  };

  const portalBadge = getPortalBadge();

  return (
    <header className="h-16 bg-[#0B1B4F] text-white border-b border-[#1E3A8A] px-4 md:px-6 flex items-center justify-between z-40 shrink-0 select-none shadow-xl sticky top-0">
      
      {/* ======================================================== */}
      {/* LEFT: Mobile Hamburger + Landing Page Brand Logo        */}
      {/* ======================================================== */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/15"
          aria-label="Toggle navigation menu"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Logo matching Landing Page */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left group transition-transform hover:scale-[1.02]"
        >
          {/* 3 dots from landing page */}
          <div className="flex items-center gap-1 shrink-0">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8] inline-block" />
            <span className="w-2 h-2 rounded-full bg-[#E50914] inline-block" />
            <span className="w-2 h-2 rounded-full bg-white inline-block" />
          </div>

          <div className="flex items-center gap-1">
            <span className="font-black text-xl tracking-tight text-white">ResQ</span>
            <span className="font-black text-xl text-[#E50914]">Grid</span>
          </div>

          {/* Subsystem Tag */}
          <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${portalBadge.color} ml-1`}>
            {portalBadge.label}
          </span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* CENTER: Desktop Top Navigation Links                     */}
      {/* ======================================================== */}
      <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
        {navLinks.map((item) => {
          const isActive = location.pathname === item.path || (item.path !== '/citizen' && item.path !== '/ambulance' && item.path !== '/dispatcher' && item.path !== '/hospital' && item.path !== '/admin' && location.pathname.startsWith(item.path));
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                  : 'text-[#CBD5E1] hover:text-white hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ======================================================== */}
      {/* RIGHT: Operational Status Pill + Action CTA + User Menu */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Live Operational Status Pill */}
        <div className="hidden md:flex items-center">
          {health?.database?.connected || health?.status === 'healthy' ? (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/70 text-emerald-400 text-[11px] font-bold border border-emerald-700/60 shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              API Operational
            </span>
          ) : (
            <span
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 text-red-400 text-[11px] font-bold border border-red-700/80 shadow-inner cursor-pointer hover:bg-red-900/80 transition"
              title={health?.database?.details || 'Database connecting'}
              onClick={async () => {
                const data = await checkApiHealth();
                setHealth(data);
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
              API OFFLINE
            </span>
          )}
        </div>

        {/* Quick SOS Action CTA for Citizens */}
        {isCitizen && (
          <button
            onClick={() => navigate('/citizen/report')}
            className="hidden sm:flex items-center gap-1.5 bg-[#E50914] text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 transition-all"
          >
            <span>Launch SOS</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {/* User Session Profile & Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition text-white"
          >
            <div className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm">
              {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-xs font-bold leading-tight truncate max-w-[110px]">{user?.fullName || 'Active User'}</p>
              <p className="text-[10px] text-slate-300 capitalize font-medium">{user?.role?.replace('_', ' ') || 'Citizen'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-300 hidden sm:block" />
          </button>

          {/* User Dropdown Menu */}
          {isMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-fadeIn"
              onClick={() => setIsMenuOpen(false)}
            >
              <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                <p className="text-xs font-black text-slate-900">{user?.fullName}</p>
                <p className="text-[11px] text-slate-500 truncate font-mono">{user?.email}</p>
              </div>

              <div className="px-2 py-1">
                <button
                  onClick={() => navigate('/landing')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  Showcase Overview
                </button>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                  >
                    <Activity className="w-4 h-4 text-purple-600" />
                    Platform Diagnostics
                  </button>
                )}
              </div>

              <div className="border-t border-slate-100 my-1" />

              <div className="px-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE RESPONSIVE HAMBURGER DRAWER                       */}
      {/* ======================================================== */}
      {isMobileNavOpen && (
        <div 
          className="lg:hidden fixed inset-0 top-16 z-50 bg-[#061136]/95 backdrop-blur-xl border-t border-[#1E3A8A] p-6 overflow-y-auto"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <div className="max-w-md mx-auto space-y-6" onClick={(e) => e.stopPropagation()}>
            {/* Active User Card */}
            <div className="p-4 rounded-2xl bg-[#0B1B4F] border border-[#1E3A8A] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {user?.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{user?.fullName}</p>
                  <p className="text-[11px] text-red-400 font-semibold capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${portalBadge.color}`}>
                {portalBadge.label}
              </span>
            </div>

            {/* Quick Navigation Links for Active Role */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-2 px-1">
                PORTAL DIRECTORY
              </span>
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      setIsMobileNavOpen(false);
                      navigate(item.path);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-xs transition ${
                      isActive
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                        : 'text-slate-200 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Emergency Action & Showcase Links */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              {isCitizen && (
                <button
                  onClick={() => {
                    setIsMobileNavOpen(false);
                    navigate('/citizen/report');
                  }}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl bg-[#E50914] text-white font-extrabold text-xs shadow-lg shadow-red-600/40"
                >
                  <span className="flex items-center gap-2">
                    <Radio className="w-4 h-4" />
                    Launch 1-Tap SOS
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  navigate('/landing');
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 font-bold text-xs"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                Showcase Overview
              </button>

              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl text-red-400 hover:bg-red-950/40 font-bold text-xs"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
