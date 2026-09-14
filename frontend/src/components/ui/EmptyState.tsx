// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: UI Component - EmptyState
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateActionObj {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message?: string;
  description?: string;
  action?: React.ReactNode | EmptyStateActionObj;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <Inbox className="w-10 h-10 text-slate-400" />,
  title = 'No records found',
  message,
  description,
  action,
  className = '',
}) => {
  const displayText = description || message || 'There are no active items to display right now.';

  const renderAction = () => {
    if (!action) return null;

    if (React.isValidElement(action)) {
      return action;
    }

    if (typeof action === 'object' && 'label' in action && 'onClick' in action) {
      const actionObj = action as EmptyStateActionObj;
      return (
        <Button
          variant={actionObj.variant || 'primary'}
          size="sm"
          onClick={actionObj.onClick}
        >
          {actionObj.label}
        </Button>
      );
    }

    return null;
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl ${className}`}
    >
      <div className="mb-3">{icon}</div>
      <h3 className="text-sm font-bold text-slate-800 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 max-w-sm mb-4">{displayText}</p>
      {renderAction() && <div>{renderAction()}</div>}
    </div>
  );
};

export default EmptyState;
