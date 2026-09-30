import React from 'react';

interface RiskLegendProps {
  className?: string;
  horizontal?: boolean;
}

export const RiskLegend: React.FC<RiskLegendProps> = ({ className = '', horizontal = true }) => {
  const tiers = [
    { label: 'Critical', range: '75–100', color: 'bg-red-500', text: 'text-red-400' },
    { label: 'High', range: '50–74', color: 'bg-orange-500', text: 'text-orange-400' },
    { label: 'Moderate', range: '25–49', color: 'bg-amber-500', text: 'text-amber-400' },
    { label: 'Low', range: '0–24', color: 'bg-emerald-500', text: 'text-emerald-400' },
  ];

  return (
    <div
      className={`bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 text-[11px] font-sans ${className}`}
    >
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
        <span>Risk Screening Index</span>
        <span className="font-mono text-slate-500">Heuristic 0–100</span>
      </div>
      <div className={horizontal ? 'flex flex-wrap items-center gap-3' : 'space-y-1.5'}>
        {tiers.map((tier) => (
          <div key={tier.label} className="flex items-center space-x-1.5">
            <span className={`w-2.5 h-2.5 rounded-sm ${tier.color}`} />
            <span className={`font-semibold ${tier.text}`}>{tier.label}</span>
            <span className="font-mono text-slate-500 text-[10px]">({tier.range})</span>
          </div>
        ))}
      </div>
    </div>
  );
};
