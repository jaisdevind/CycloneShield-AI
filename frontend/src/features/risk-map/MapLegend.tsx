import React from 'react';
import { Info, ShieldAlert } from 'lucide-react';

interface MapLegendProps {
  isDemo?: boolean;
}

const ASSET_TYPES = [
  { label: 'Hospital', color: '#ef4444' },
  { label: 'Shelter', color: '#10b981' },
  { label: 'Power Substation', color: '#f59e0b' },
  { label: 'Port', color: '#06b6d4' },
  { label: 'Telecom', color: '#a78bfa' },
  { label: 'Water Treatment', color: '#34d399' },
];

const RISK_TIERS = [
  { label: 'Critical (≥75)', bg: 'bg-red-500' },
  { label: 'High (50–74)', bg: 'bg-orange-500' },
  { label: 'Moderate (25–49)', bg: 'bg-amber-500' },
  { label: 'Low (<25)', bg: 'bg-emerald-500' },
];

export const MapLegend: React.FC<MapLegendProps> = ({ isDemo = false }) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl p-3 text-[11px] shadow-xl max-w-[240px] space-y-2">
      <div className="font-semibold text-slate-300 flex items-center justify-between border-b border-slate-800 pb-1.5">
        <span className="flex items-center space-x-1">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Infrastructure Categories</span>
        </span>
      </div>

      <div className="grid grid-cols-2 gap-1.5 text-slate-400">
        {ASSET_TYPES.map((item) => (
          <div key={item.label} className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
            <span className="truncate">{item.label}</span>
          </div>
        ))}
      </div>

      <div className="pt-1.5 border-t border-slate-800/80">
        <div className="text-[10px] text-slate-400 font-semibold mb-1">Risk Tier Colors</div>
        <div className="flex items-center justify-between gap-1">
          {RISK_TIERS.map((tier) => (
            <div key={tier.label} className="flex flex-col items-center flex-1">
              <span className={`w-full h-1 rounded-sm ${tier.bg}`} />
              <span className="text-[8px] text-slate-400 font-mono mt-0.5">{tier.label.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>

      {isDemo && (
        <div className="pt-1.5 border-t border-slate-800/80 flex items-center space-x-1 text-[10px] text-amber-400 font-mono">
          <ShieldAlert className="w-3 h-3 shrink-0" />
          <span>Screening Heuristic Models</span>
        </div>
      )}
    </div>
  );
};
