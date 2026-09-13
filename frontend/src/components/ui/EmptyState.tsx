// ============================================================
// PRIMARY OWNER: SK / khushi.shettyyy
// ROLE: Core Platform + Dispatcher Command UI
// MODULE: UI Component - Empty State
// ============================================================

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon = Inbox,
  actionLabel,
  onAction,
  compact = false,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center rounded-2xl bg-[#07133A]/80 border border-blue-900/30 select-none backdrop-blur-sm ${
        compact ? 'p-4' : 'p-6 md:p-8'
      } ${className}`}
    >
      <div className="w-12 h-12 rounded-xl bg-blue-950/60 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mb-3 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
        <Icon className="w-6 h-6 drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]" />
      </div>
      <h4 className="text-sm md:text-base font-bold text-white tracking-tight font-display mb-1.5">
        {title}
      </h4>
      {description && (
        <p className="text-xs text-slate-400 max-w-sm mb-3.5 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button variant="secondary" size="sm" onClick={onAction} className="text-xs font-semibold bg-[#2563EB] hover:bg-blue-600 text-white border border-blue-500/50 shadow-[0_0_10px_rgba(37,99,235,0.3)]">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
