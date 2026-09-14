import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { checkApiHealth, type ApiHealthResponse } from '../../services/api';
import { 
  ShieldAlert, 
  Activity, 
  User, 
  LogOut, 
  Radio, 
  Bell, 
  ChevronDown,
  Zap,
  Ambulance,
  LayoutDashboard,
  Building2,
  Menu,
  X,
  MapPin,
  HeartPulse,
} from 'lucide-react';

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, switchDemoRole } = useAuthStore();
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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isDispatcher = location.pathname.startsWith('/dispatcher');
  const isHospital = location.pathname.startsWith('/hospital');
  const isAmbulance = location.pathname.startsWith('/ambulance');
  const isCitizen = location.pathname.startsWith('/citizen');

  return (
    <header className="h-16 bg-[#0A192F] text-white border-b border-slate-800 px-4 md:px-6 flex items-center justify-between z-30 shrink-0 select-none shadow-lg relative">
      {/* Left: Hamburger (Mobile) + Brand Logo & Live Pulse */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Mobile Hamburger Toggle Button */}
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
          aria-label="Toggle mobile menu"
        >
          {isMobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-left group transition-transform hover:scale-[1.02]"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-[#B80710] flex items-center justify-center text-white shadow-md shadow-red-600/40 border border-red-400/40">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-black text-lg tracking-tight text-white">ResQ</span>
              <span className="font-black text-lg text-red-500">Grid</span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block font-semibold">Emergency Response & Trauma Network</p>
          </div>
        </button>

        {/* Live Operational Status */}
        <div className="hidden xl:flex items-center gap-2 pl-4 border-l border-slate-800">
          {health?.database?.connected ? (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-400 text-xs font-bold border border-emerald-700/60 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Platform Active {health?.database?.latencyMs ? `(${health.database.latencyMs}ms)` : `(${health?.uptimeSeconds || 0}s)`}
            </span>
          ) : (
            <span
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/80 text-red-400 text-xs font-bold border border-red-700/80 shadow-inner cursor-pointer hover:bg-red-900/80 transition"
              title={health?.database?.details || 'Supabase PostgreSQL database is offline'}
              onClick={async () => {
                const data = await checkApiHealth();
                setHealth(data);
              }}
            >
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              DATABASE OFFLINE / ERROR
            </span>
          )}
        </div>
      </div>

      {/* Center: Interactive Portal Switcher Pills (Desktop) */}
      <div className="hidden lg:flex items-center bg-slate-900/90 border border-slate-800 rounded-2xl p-1 shadow-inner gap-1">
        <button
          onClick={() => {
            const path = switchDemoRole('citizen');
            navigate(path);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            isCitizen ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
          <span>Citizen SOS</span>
        </button>

        <button
          onClick={() => {
            const path = switchDemoRole('ambulance_driver');
            navigate(path);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            isAmbulance ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Ambulance className="w-3.5 h-3.5 shrink-0" />
          <span>Driver Cockpit</span>
        </button>

        <button
          onClick={() => {
            const path = switchDemoRole('dispatcher');
            navigate(path);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            isDispatcher ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5 shrink-0" />
          <span>Dispatch Hub</span>
        </button>

        <button
          onClick={() => {
            const path = switchDemoRole('hospital_admin');
            navigate(path);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
            isHospital ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span>Trauma Unit</span>
        </button>
      </div>

      {/* Right: Quick SOS CTA & Profile Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={() => navigate('/citizen/report')}
          className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full bg-gradient-to-r from-red-600 to-[#B80710] hover:from-red-500 hover:to-red-600 text-white text-xs font-black transition-all shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95 border border-red-400/40 cursor-pointer"
        >
          <Radio className="w-3.5 sm:w-4 h-3.5 sm:h-4 animate-pulse" />
          <span className="hidden xs:inline">1-TAP SOS</span>
          <span className="xs:hidden">SOS</span>
        </button>

        <button
          onClick={() => navigate('/dispatcher/notifications')}
          className="p-2 sm:p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors relative border border-slate-800"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
        </button>

        {/* User Account Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800 transition-colors border border-slate-800 hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-white text-xs font-black">
              {user?.fullName ? user.fullName[0] : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-black leading-tight text-white">{user?.fullName || 'User Profile'}</p>
              <p className="text-[10px] text-slate-400 capitalize font-semibold">{user?.role?.replace('_', ' ') || 'Active Session'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

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
                  onClick={() => navigate('/citizen/profile')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  Medical ID Profile
                </button>
                <button
                  onClick={() => navigate('/admin')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <Activity className="w-4 h-4 text-slate-400" />
                  Platform Diagnostics
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  <Zap className="w-4 h-4 text-amber-500" />
                  Showcase Landing Page
                </button>
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

      {/* Mobile Hamburger Navigation Drawer */}
      {isMobileNavOpen && (
        <div 
          className="lg:hidden fixed inset-0 top-16 z-50 bg-[#060D1E]/95 backdrop-blur-xl border-t border-slate-800 p-6 overflow-y-auto"
          onClick={() => setIsMobileNavOpen(false)}
        >
          <div className="max-w-md mx-auto space-y-6" onClick={(e) => e.stopPropagation()}>
            <div>
              <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-2">
                OPERATIONAL PORTAL SWITCHER
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const path = switchDemoRole('citizen');
                    setIsMobileNavOpen(false);
                    navigate(path);
                  }}
                  className={`p-3 rounded-xl text-left border transition flex items-center gap-2.5 ${
                    isCitizen ? 'bg-red-600/20 border-red-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <Radio className="w-4 h-4 text-red-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Citizen SOS</p>
                    <p className="text-[10px] text-slate-400">Emergency Intake</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const path = switchDemoRole('ambulance_driver');
                    setIsMobileNavOpen(false);
                    navigate(path);
                  }}
                  className={`p-3 rounded-xl text-left border transition flex items-center gap-2.5 ${
                    isAmbulance ? 'bg-blue-600/20 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <Ambulance className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Driver Fleet</p>
                    <p className="text-[10px] text-slate-400">Cockpit HUD</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const path = switchDemoRole('dispatcher');
                    setIsMobileNavOpen(false);
                    navigate(path);
                  }}
                  className={`p-3 rounded-xl text-left border transition flex items-center gap-2.5 ${
                    isDispatcher ? 'bg-purple-600/20 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Dispatch Hub</p>
                    <p className="text-[10px] text-slate-400">Command Grid</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    const path = switchDemoRole('hospital_admin');
                    setIsMobileNavOpen(false);
                    navigate(path);
                  }}
                  className={`p-3 rounded-xl text-left border transition flex items-center gap-2.5 ${
                    isHospital ? 'bg-emerald-600/20 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Trauma Unit</p>
                    <p className="text-[10px] text-slate-400">ICU Network</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Quick Navigation Links */}
            <div className="border-t border-slate-800 pt-4 space-y-1">
              <span className="text-[10px] font-black text-slate-400 tracking-wider uppercase block mb-2">
                QUICK DIRECTORY
              </span>
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  navigate('/citizen/report');
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-red-600 text-white font-extrabold text-xs"
              >
                <span className="flex items-center gap-2">
                  <Radio className="w-4 h-4" />
                  Launch 1-Tap SOS
                </span>
                <span>Immediate</span>
              </button>
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  navigate('/citizen/tracking');
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-xs"
              >
                <MapPin className="w-4 h-4 text-slate-400" />
                Live Incident Tracking
              </button>
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  navigate('/dispatcher/routes');
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-xs"
              >
                <Zap className="w-4 h-4 text-slate-400" />
                Green Signal Corridors
              </button>
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  navigate('/hospital/emergency');
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-xs"
              >
                <HeartPulse className="w-4 h-4 text-slate-400" />
                Inbound Trauma Telemetry
              </button>
              <button
                onClick={() => {
                  setIsMobileNavOpen(false);
                  navigate('/admin');
                }}
                className="w-full flex items-center gap-2.5 p-3 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 font-bold text-xs"
              >
                <Activity className="w-4 h-4 text-slate-400" />
                Platform Diagnostics
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Topbar;
