// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: UI Component - Card
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  const hasBg = /\bbg-/.test(className);
  const hasBorder = /\bborder-/.test(className);
  const hasRounded = /\brounded-/.test(className);
  const hasPadding = /\bp[xytrbl]?-|\bp-/.test(className);
  const hasText = /\btext-/.test(className);

  const defaultClasses = [
    hasBg ? '' : 'bg-[#0B1B4F]/90 backdrop-blur-md',
    hasBorder ? '' : 'border border-[#1E3A8A]',
    hasRounded ? '' : 'rounded-2xl',
    hasPadding ? '' : 'p-5',
    hasText ? '' : 'text-white',
    'shadow-xl',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`${defaultClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

