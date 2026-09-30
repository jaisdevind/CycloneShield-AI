import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  variant = 'warning',
  onConfirm,
  onCancel,
  isProcessing = false,
}) => {
  if (!isOpen) return null;

  const getConfirmButtonClass = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-500 text-white';
      case 'primary':
        return 'bg-cyan-600 hover:bg-cyan-500 text-white';
      case 'warning':
      default:
        return 'bg-amber-600 hover:bg-amber-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2 text-amber-400">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <h3 className="text-base font-bold text-white">{title}</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-300 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">{message}</p>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${getConfirmButtonClass()} disabled:opacity-50`}
          >
            {isProcessing ? (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{confirmLabel}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
