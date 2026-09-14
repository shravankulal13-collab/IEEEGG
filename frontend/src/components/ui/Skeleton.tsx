// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: UI Component - Skeleton
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  width,
  height,
}) => {
  const variantClasses = {
    text: 'rounded h-4 w-full',
    circular: 'rounded-full',
    rectangular: 'rounded-xl',
  };

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      style={style}
      className={`bg-slate-200 animate-pulse ${variantClasses[variant]} ${className}`}
    />
  );
};
