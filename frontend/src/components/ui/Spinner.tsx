// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: UI Component - Spinner
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'danger' | 'white' | 'slate';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };

  const colorClasses = {
    primary: 'border-blue-600 border-t-transparent',
    danger: 'border-red-600 border-t-transparent',
    white: 'border-white border-t-transparent',
    slate: 'border-slate-400 border-t-transparent',
  };

  return (
    <div
      className={`inline-block rounded-full animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};
