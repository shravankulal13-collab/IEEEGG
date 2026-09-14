// ============================================================
// PRIMARY OWNER: SK
// ROLE: Core Platform + Backend Integration Lead
// MODULE: UI Component - ConfirmDialog
// NOTE: Shared dependency -- changes require team coordination.
// ============================================================

import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="flex flex-col items-center text-center p-2">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${
            variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
          }`}
        >
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 mb-6 leading-relaxed">{message}</p>
        <div className="flex items-center gap-3 w-full">
          <Button variant="outline" fullWidth onClick={onClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant}
            fullWidth
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
