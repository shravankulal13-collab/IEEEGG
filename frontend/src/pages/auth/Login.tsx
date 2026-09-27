// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Auth - User Login Portal
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useAuthStore } from '../../store/authStore';
import { getDefaultRolePath } from '../../components/layout/RoleGuard';
import { ShieldAlert, ArrowRight, Ambulance, Building2, LayoutDashboard, User, ShieldCheck, Lock, Mail, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError, user, token } = useAuth();

  const [email, setEmail] = useState('citizen@example.com');
  const [password, setPassword] = useState('Emergency123!');
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'ambulance_driver' | 'dispatcher' | 'hospital_admin'>('citizen');

  const demoAccounts = [
    { role: 'citizen', label: 'Citizen', email: 'citizen@example.com', icon: <User className="w-3.5 h-3.5" />, dest: '/citizen' },
    { role: 'ambulance_driver', label: 'Driver', email: 'driver@example.com', icon: <Ambulance className="w-3.5 h-3.5" />, dest: '/ambulance' },
    { role: 'dispatcher', label: 'Dispatcher', email: 'dispatcher@example.com', icon: <LayoutDashboard className="w-3.5 h-3.5" />, dest: '/dispatcher' },
    { role: 'hospital_admin', label: 'Hospital', email: 'hospital@example.com', icon: <Building2 className="w-3.5 h-3.5" />, dest: '/hospital' },
  ];

  useEffect(() => {
    if (token && user) {
      navigate(getDefaultRolePath(user.role), { replace: true });
    }
  }, [token, user, navigate]);

  const handleSelectRole = (roleItem: typeof demoAccounts[0]) => {
    setSelectedRole(roleItem.role as any);
    setEmail(roleItem.email);
    setPassword('Emergency123!');
    clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      const from = (location.state as any)?.from?.pathname;
      if (from && from !== '/login' && from !== '/') {
        navigate(from, { replace: true });
        return;
      }
      const currentUser = useAuthStore.getState().user;
      const targetRole = currentUser?.role || selectedRole;
      const dest = getDefaultRolePath(targetRole);
      navigate(dest, { replace: true });
    } catch {
      // Error handled by zustand store
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden text-slate-100"
      style={{
        backgroundColor: '#061136',
        backgroundImage: 'radial-gradient(circle at 50% 10%, #102B7B 0%, #0B1B4F 45%, #061136 100%)',
      }}
    >
      {/* Ambient glows */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/30 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div className="text-left">
            <span className="text-xl font-extrabold text-white tracking-tight">ResQ</span>
            <span className="text-xl font-extrabold text-[#E50914] tracking-tight">Grid</span>
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Sign in to your portal</h2>
        <p className="mt-1 text-xs text-slate-300">
          Emergency medical response coordination for citizens, drivers & hospitals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B1B4F]/90 backdrop-blur-xl py-8 px-6 shadow-2xl border border-[#1E3A8A] rounded-3xl sm:px-10 text-white">
          {/* Quick Demo Role Switcher */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Select Demo Role (1-Click Quick Fill)
            </label>
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-slate-900/70 rounded-xl border border-white/10">
              {demoAccounts.map((acc) => {
                const isSelected = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectRole(acc)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {acc.icon}
                    <span className="mt-1 truncate max-w-full">{acc.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center gap-2 text-xs font-semibold text-red-200">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Email address</label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError();
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-white/15 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-slate-900/80 text-white placeholder-slate-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-sky-400 hover:text-sky-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearError();
                  }}
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-white/15 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-slate-900/80 text-white placeholder-slate-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#E50914] hover:bg-[#D9232D] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-400">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-bold text-sky-400 hover:text-sky-300">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
