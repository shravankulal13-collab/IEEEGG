// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: UI Component - Badge
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className = '' }) => {
  const variantClasses = {
    success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    warning: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    danger: 'bg-red-500/20 text-red-300 border-red-500/40',
    info: 'bg-blue-500/20 text-sky-300 border-blue-500/40',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
