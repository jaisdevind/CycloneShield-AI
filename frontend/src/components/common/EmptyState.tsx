import React from 'react';
import { LucideIcon, Database } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  description = 'No matching geospatial features or infrastructure records match the selected criteria.',
  icon: Icon = Database,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`bg-slate-900/60 border border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center text-center space-y-3 ${className}`}
    >
      <div className="p-3 bg-slate-800/80 rounded-full text-slate-400 border border-slate-700">
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-200">{title}</h4>
        <p className="text-xs text-slate-400 max-w-md leading-relaxed">{description}</p>
      </div>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
