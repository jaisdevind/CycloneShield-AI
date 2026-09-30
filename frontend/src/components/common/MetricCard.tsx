import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  footer?: React.ReactNode;
  icon: LucideIcon;
  variant?: 'cyan' | 'red' | 'orange' | 'emerald' | 'amber' | 'slate';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  footer,
  icon: Icon,
  variant = 'cyan',
  className = '',
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'red':
        return {
          iconBox: 'bg-red-500/10 text-red-400 border-red-500/20',
          valueColor: 'text-red-400',
        };
      case 'orange':
        return {
          iconBox: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          valueColor: 'text-orange-400',
        };
      case 'emerald':
        return {
          iconBox: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          valueColor: 'text-emerald-400',
        };
      case 'amber':
        return {
          iconBox: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          valueColor: 'text-amber-400',
        };
      case 'slate':
        return {
          iconBox: 'bg-slate-800 text-slate-300 border-slate-700',
          valueColor: 'text-white',
        };
      case 'cyan':
      default:
        return {
          iconBox: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          valueColor: 'text-cyan-400',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      className={`bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-slate-700 transition shadow-sm ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg border ${styles.iconBox}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline space-x-1.5">
          <span className={`text-3xl font-bold font-mono tracking-tight ${styles.valueColor}`}>
            {value}
          </span>
          {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
        </div>
        {subtitle && <div className="text-xs text-slate-300 font-medium mt-1">{subtitle}</div>}
      </div>

      {footer && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500">
          {footer}
        </div>
      )}
    </div>
  );
};
