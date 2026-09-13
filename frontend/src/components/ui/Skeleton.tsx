// ============================================================
// PRIMARY OWNER: SK / khushi.shettyyy
// ROLE: Core Platform + Dispatcher Command UI
// MODULE: UI Component - Skeleton Shimmer
// ============================================================

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rectangular',
  width,
  height,
}) => {
  const variantClass =
    variant === 'circular'
      ? 'rounded-full'
      : variant === 'text'
      ? 'rounded h-4 my-1'
      : 'rounded-lg';

  const style: React.CSSProperties = {
    width: width,
    height: height,
  };

  return (
    <div
      className={`ops-shimmer bg-blue-950/40 border border-blue-900/20 ${variantClass} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};
