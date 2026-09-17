// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Auth - User Login Portal
// ============================================================

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRight, Ambulance, Building2, LayoutDashboard, User, ShieldCheck, Lock, Mail, AlertCircle } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();

  const [email, setEmail] = useState('citizen@example.com');
  const [password, setPassword] = useState('Emergency123!');
  const [selectedRole, setSelectedRole] = useState<'citizen' | 'ambulance_driver' | 'dispatcher' | 'hospital_admin' | 'system_admin'>('citizen');

  const demoAccounts = [
    { role: 'citizen', label: 'Citizen', email: 'citizen@example.com', icon: <User className="w-3.5 h-3.5" />, dest: '/citizen' },
    { role: 'ambulance_driver', label: 'Driver', email: 'driver@example.com', icon: <Ambulance className="w-3.5 h-3.5" />, dest: '/ambulance' },
    { role: 'dispatcher', label: 'Dispatcher', email: 'dispatcher@example.com', icon: <LayoutDashboard className="w-3.5 h-3.5" />, dest: '/dispatcher' },
    { role: 'hospital_admin', label: 'Hospital', email: 'hospital@example.com', icon: <Building2 className="w-3.5 h-3.5" />, dest: '/hospital' },
    { role: 'system_admin', label: 'Admin', email: 'admin@example.com', icon: <ShieldCheck className="w-3.5 h-3.5" />, dest: '/admin' },
  ];

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
      if (from) {
        navigate(from, { replace: true });
        return;
      }
      const matched = demoAccounts.find((a) => a.role === selectedRole);
      navigate(matched ? matched.dest : '/citizen', { replace: true });
    } catch {
      // Error handled by zustand store
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
          <img src="/logo.png" alt="ResQGrid Logo" className="w-12 h-12 object-contain rounded-full group-hover:scale-105 transition-transform shadow-md" />
          <div className="text-left">
            <span className="text-2xl font-extrabold text-[#0B1B4F] tracking-tight">ResQ</span>
            <span className="text-2xl font-extrabold text-[#E50914] tracking-tight">Grid</span>
          </div>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sign in to your portal</h2>
        <p className="mt-1 text-xs text-slate-500">
          Emergency response coordination for citizens, drivers & hospitals
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-slate-200/80 rounded-3xl sm:px-10">
          {/* Quick Demo Role Switcher */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Select Demo Role (1-Click Quick Fill)
            </label>
            <div className="grid grid-cols-5 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
              {demoAccounts.map((acc) => {
                const isSelected = selectedRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    onClick={() => handleSelectRole(acc)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-[10px] font-bold transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
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
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs font-semibold text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email address</label>
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
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <Link to="/forgot-password" className="text-xs font-semibold text-red-600 hover:text-red-700">
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
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-[#E50914] hover:bg-[#D9232D] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
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

          <div className="mt-6 text-center text-xs text-slate-500">
            <span>Don't have an account? </span>
            <Link to="/register" className="font-bold text-red-600 hover:text-red-700">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
