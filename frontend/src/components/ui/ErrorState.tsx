// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: UI Component - ErrorState
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';
import { AlertOctagon, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading data.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-red-50/50 border border-red-200 rounded-2xl ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
        <AlertOctagon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-red-950 mb-1">{title}</h3>
      <p className="text-xs text-red-700 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Try Again
        </Button>
      )}
    </div>
  );
};
