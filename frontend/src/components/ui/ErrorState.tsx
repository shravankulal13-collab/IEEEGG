// ============================================================
// PRIMARY OWNER: SK / khushi.shettyyy
// ROLE: Core Platform + Dispatcher Command UI
// MODULE: UI Component - Error State
// ============================================================

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load operational data',
  message = 'An unexpected error occurred while communicating with the emergency services.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center rounded-xl bg-red-50/40 border border-red-200/60 ${className}`}
    >
      <div className="w-11 h-11 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-3">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-semibold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onRetry}
        >
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Request</span>
          </span>
        </Button>
      )}
    </div>
  );
};
