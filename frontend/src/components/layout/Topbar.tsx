// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Landing Page Style Master Top Header Navigation
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { checkApiHealth, type ApiHealthResponse } from '../../services/api';
import { getDefaultRolePath } from './RoleGuard';
import { 
  FileText, 
  LogOut, 
  Radio, 
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
  const profileMenuRef = useRef<HTMLDivElement>(null);

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

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

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

  // Role-Specific Navigation Links to actual sub-pages/actions
  const getNavLinks = (): NavItem[] => {
    if (isDispatcher) {
      return [
        { label: 'Fleet', path: '/dispatcher/fleet', icon: <Ambulance className="w-4 h-4" /> },
        { label: 'Hospitals', path: '/dispatcher/hospitals', icon: <Building2 className="w-4 h-4" /> },
        { label: 'Incidents', path: '/dispatcher/incidents', icon: <FileText className="w-4 h-4" /> },
        { label: 'Green Corridors', path: '/dispatcher/routes', icon: <Zap className="w-4 h-4" /> },
        { label: 'Traffic Grid', path: '/dispatcher/traffic', icon: <Activity className="w-4 h-4" /> },
        { label: 'Analytics', path: '/dispatcher/analytics', icon: <Layers className="w-4 h-4" /> },
        { label: 'Audit Logs', path: '/dispatcher/audit', icon: <ShieldCheck className="w-4 h-4" /> },
      ];
    }

    if (isHospital) {
      return [
        { label: 'Live Inbound', path: '/hospital/emergency', icon: <HeartPulse className="w-4 h-4" /> },
        { label: 'Beds & ICU', path: '/hospital/resources', icon: <Activity className="w-4 h-4" /> },
        { label: 'Doctors On-Call', path: '/hospital/doctors', icon: <User className="w-4 h-4" /> },
        { label: 'Patient History', path: '/hospital/history', icon: <FileText className="w-4 h-4" /> },
      ];
    }

    if (isAmbulance) {
      return [
        { label: 'Active Call', path: '/ambulance/active', icon: <Flame className="w-4 h-4" /> },
        { label: 'Dispatches', path: '/ambulance/dispatch', icon: <Zap className="w-4 h-4" /> },
        { label: 'GPS Navigation', path: '/ambulance/navigation', icon: <MapPin className="w-4 h-4" /> },
        { label: 'Vehicle Readiness', path: '/ambulance/status', icon: <Activity className="w-4 h-4" /> },
        { label: 'Trip Logs', path: '/ambulance/history', icon: <History className="w-4 h-4" /> },
      ];
    }

    if (isAdmin) {
      return [
        { label: 'Diagnostics', path: '/admin', icon: <Activity className="w-4 h-4" /> },
        { label: 'Citizen View', path: '/citizen', icon: <Radio className="w-4 h-4" /> },
        { label: 'Dispatch Hub', path: '/dispatcher', icon: <LayoutDashboard className="w-4 h-4" /> },
        { label: 'Ambulance Unit', path: '/ambulance', icon: <Ambulance className="w-4 h-4" /> },
        { label: 'Hospital Grid', path: '/hospital', icon: <Building2 className="w-4 h-4" /> },
      ];
    }

    // Default: Citizen Portal
    return [
      { label: 'Live Intel Feed', path: '/citizen', icon: <Radio className="w-4 h-4" /> },
      { label: 'Report Emergency', path: '/citizen/report', icon: <Zap className="w-4 h-4" /> },
      { label: 'Live Tracking', path: '/citizen/tracking', icon: <MapPin className="w-4 h-4" /> },
      { label: 'Emergency History', path: '/citizen/history', icon: <History className="w-4 h-4" /> },
      { label: 'Public Alerts', path: '/public', icon: <FileText className="w-4 h-4" /> },
    ];
  };

  const navLinks = getNavLinks();

  const getHomePath = () => {
    if (isDispatcher) return '/dispatcher';
    if (isHospital) return '/hospital';
    if (isAmbulance) return '/ambulance';
    if (isAdmin) return '/admin';
    return '/citizen';
  };

  return (
    <header className="h-16 bg-[#0B1B4F] text-white border-b border-[#1E3A8A] px-4 md:px-6 flex items-center justify-between z-40 shrink-0 select-none shadow-xl sticky top-0">
      
      {/* ======================================================== */}
      {/* LEFT: Mobile Hamburger + Landing Page Brand Logo        */}
      {/* ======================================================== */}
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors border border-white/15 cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Brand Logo directing to user's dashboard home */}
        <button
          onClick={() => navigate(getHomePath())}
          className="flex items-center gap-2.5 text-left group transition-transform hover:scale-[1.02] cursor-pointer"
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
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
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
      {/* RIGHT: User Menu                                         */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Standard User Account Profile Icon */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-slate-200 hover:text-white transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
            aria-label="User Account Menu"
            title="User Profile Account"
          >
            <User className="w-5 h-5 text-slate-200" />
          </button>

          {/* User Account Dropdown Menu */}
          {isMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-60 bg-[#0B1B4F]/98 backdrop-blur-xl text-white rounded-2xl shadow-2xl border border-[#1E3A8A] py-2 z-50 animate-fadeIn divide-y divide-white/10"
              onClick={() => setIsMenuOpen(false)}
            >
              {/* Account Info Header */}
              <div className="px-4 py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sky-400 shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-black text-white truncate">{user?.fullName || 'Active User'}</p>
                  <p className="text-[11px] text-slate-300 truncate font-mono">{user?.email || 'user@resqgrid.io'}</p>
                  <p className="text-[10px] text-slate-400 capitalize font-medium mt-0.5">{user?.role?.replace('_', ' ') || 'Citizen'}</p>
                </div>
              </div>

              {/* Admin Diagnostics (only if system admin) */}
              {isAdmin && (
                <div className="px-2 py-1.5">
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-white/10 rounded-xl transition cursor-pointer"
                  >
                    <Activity className="w-4 h-4 text-purple-400" />
                    <span>Platform Diagnostics</span>
                  </button>
                </div>
              )}

              {/* Sign Out Button */}
              <div className="p-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-400 hover:text-white hover:bg-red-600/30 rounded-xl transition cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
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
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-sky-400 shadow-md shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">{user?.fullName || 'Active User'}</p>
                  <p className="text-[11px] text-slate-300 font-medium capitalize">{user?.role?.replace('_', ' ') || 'Citizen'}</p>
                </div>
              </div>
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
                    className={`w-full flex items-center gap-3 p-3 rounded-xl font-bold text-xs transition cursor-pointer ${
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

            {/* Sign Out Link */}
            <div className="border-t border-white/10 pt-4 space-y-2">
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl text-red-400 hover:bg-red-950/40 font-bold text-xs cursor-pointer"
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

export default Topbar;
