// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: UI Component - Select
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-xs font-bold text-slate-200">{label}</label>}
      <select
        className={`w-full px-3.5 py-2.5 border rounded-xl text-xs bg-slate-900/90 text-white focus:outline-none focus:ring-2 focus:ring-sky-400 border-white/20 transition-all ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        } ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-red-400 font-semibold">{error}</span>}
    </div>
  );
};
