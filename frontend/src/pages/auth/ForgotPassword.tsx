// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: Auth - Forgot Password Portal
// ============================================================

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { ShieldAlert, ArrowRight, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await authService.forgotPassword(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit recovery request');
    } finally {
      setIsLoading(false);
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
        <h2 className="text-2xl font-extrabold text-white tracking-tight">Reset your password</h2>
        <p className="mt-1 text-xs text-slate-300">
          Enter your registered email to receive recovery instructions
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-[#0B1B4F]/90 backdrop-blur-xl py-8 px-6 shadow-2xl border border-[#1E3A8A] rounded-3xl sm:px-10 text-white">
          {submitted ? (
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Instructions Sent!</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6">
                If an account exists with <strong className="text-sky-400">{email}</strong>, you will receive password reset instructions shortly.
              </p>
              <Link
                to="/login"
                className="w-full inline-flex justify-center py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors border border-white/15"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 flex items-center gap-2 text-xs font-semibold text-red-200">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

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
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 text-sm border border-white/15 rounded-xl focus:ring-2 focus:ring-sky-400 focus:border-sky-400 bg-slate-900/80 text-white placeholder-slate-500"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#E50914] hover:bg-[#D9232D] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <span>Sending...</span>
                ) : (
                  <>
                    <span>Send Recovery Email</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-semibold text-slate-400 hover:text-sky-300">
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
