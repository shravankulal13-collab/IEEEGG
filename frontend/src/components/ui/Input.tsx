// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: UI Component - Input
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className = '', ...props }) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-xs font-bold text-slate-200">{label}</label>}
      <input
        className={`w-full px-3.5 py-2.5 border rounded-xl text-xs bg-slate-900/90 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 border-white/20 transition-all ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400 font-semibold">{error}</span>}
    </div>
  );
};
