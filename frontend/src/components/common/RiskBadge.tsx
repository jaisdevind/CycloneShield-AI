import React from 'react';

export type RiskLevel = 'Critical' | 'High' | 'Moderate' | 'Low' | string;

interface RiskBadgeProps {
  level?: RiskLevel;
  score?: number;
  showScore?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level = 'Low',
  score,
  showScore = true,
  className = '',
  size = 'md',
}) => {
  const normalizedLevel = level.charAt(0).toUpperCase() + level.slice(1).toLowerCase();

  const getStyle = () => {
    switch (normalizedLevel) {
      case 'Critical':
        return 'bg-red-500/15 text-red-400 border-red-500/40 ring-1 ring-red-500/20';
      case 'High':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/40 ring-1 ring-orange-500/20';
      case 'Moderate':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/40 ring-1 ring-amber-500/20';
      case 'Low':
      default:
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40 ring-1 ring-emerald-500/20';
    }
  };

  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'text-[10px] px-1.5 py-0.5';
      case 'lg':
        return 'text-xs px-2.5 py-1 font-bold';
      case 'md':
      default:
        return 'text-[11px] px-2 py-0.5 font-medium';
    }
  };

  return (
    <span
      className={`inline-flex items-center space-x-1.5 font-mono rounded border uppercase tracking-wider ${getStyle()} ${getSize()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      <span>{normalizedLevel}</span>
      {showScore && score !== undefined && (
        <>
          <span className="opacity-40">•</span>
          <span className="font-bold">{score.toFixed(0)}</span>
        </>
      )}
    </span>
  );
};
