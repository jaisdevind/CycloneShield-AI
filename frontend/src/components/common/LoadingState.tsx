import React from 'react';

interface LoadingStateProps {
  message?: string;
  subtext?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading Geospatial Intelligence...',
  subtext = 'Querying Earth observation datasets and scenario models',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center space-y-3 ${className}`}>
      <div className="relative w-10 h-10">
        <div className="absolute inset-0 border-4 border-slate-800 rounded-full" />
        <div className="absolute inset-0 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
      <div className="space-y-1">
        <h4 className="text-sm font-semibold text-slate-200">{message}</h4>
        {subtext && <p className="text-xs text-slate-500 max-w-sm">{subtext}</p>}
      </div>
    </div>
  );
};
