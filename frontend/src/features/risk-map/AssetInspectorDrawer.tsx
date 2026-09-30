import React from 'react';
import { X, AlertTriangle, ShieldCheck, MapPin, Building, Activity, Info } from 'lucide-react';
import { InfrastructureAsset } from '../../types';
import { RiskBadge } from '../../components/common/RiskBadge';

interface AssetInspectorDrawerProps {
  asset: InfrastructureAsset | null;
  onClose: () => void;
}

export const AssetInspectorDrawer: React.FC<AssetInspectorDrawerProps> = ({ asset, onClose }) => {
  if (!asset) return null;

  return (
    <div className="w-[360px] bg-slate-900 border-l border-slate-800 p-5 overflow-y-auto z-20 flex flex-col justify-between shadow-2xl shrink-0 h-full">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <RiskBadge level={asset.risk_level} score={asset.risk_score} size="md" />
            <h3 className="text-base font-bold text-white mt-2 leading-snug">{asset.name}</h3>
            <span className="text-xs text-slate-400 capitalize flex items-center space-x-1 mt-0.5">
              <Building className="w-3 h-3 text-cyan-400 inline shrink-0 mr-1" />
              <span>{asset.category.replace(/_/g, ' ')} · {asset.district} District</span>
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Coordinates */}
        <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800/80">
          <MapPin className="w-3 h-3 text-cyan-400 shrink-0" />
          <span>Coordinates: {asset.lat.toFixed(4)}° N, {asset.lon.toFixed(4)}° E</span>
        </div>

        {/* Hazard Breakdown Gauges */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
            <Activity className="w-3.5 h-3.5 text-cyan-400 mr-1" />
            <span>Hazard Screening Breakdown</span>
          </span>

          {[
            { label: 'Flood Susceptibility (35%)', score: asset.flood_score, color: 'bg-cyan-500', textColor: 'text-cyan-400' },
            { label: 'Coastal Surge Inundation (35%)', score: asset.surge_score, color: 'bg-fuchsia-500', textColor: 'text-fuchsia-400' },
            { label: 'Wind Structural Stress (30%)', score: asset.wind_score, color: 'bg-red-500', textColor: 'text-red-400' },
          ].map(({ label, score, color, textColor }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className={textColor}>{label}</span>
                <span className="font-mono text-slate-200">{score?.toFixed(1) ?? '—'}/100</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className={`${color} h-full rounded-full transition-all`} style={{ width: `${score ?? 0}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Geographic & Physical Attributes */}
        <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-lg border border-slate-800/80 font-mono">
          <div>
            <span className="text-slate-500 block">Elevation ASL</span>
            <span className="text-slate-200">{asset.elevation_m} m</span>
          </div>
          <div>
            <span className="text-slate-500 block">Coast Distance</span>
            <span className="text-slate-200">{asset.distance_to_coast_km} km</span>
          </div>
          <div>
            <span className="text-slate-500 block">Structure Type</span>
            <span className="text-slate-200 capitalize">{asset.structural_type?.replace(/_/g, ' ') ?? 'Reinforced Concrete'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Capacity</span>
            <span className="text-slate-200">{asset.capacity ? `${asset.capacity} persons` : 'N/A'}</span>
          </div>
        </div>

        {/* Model Rationale */}
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5 flex items-center space-x-1">
            <Info className="w-3.5 h-3.5 text-cyan-400 mr-1" />
            <span>Deterministic Model Rationale</span>
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">{asset.explanation}</p>
        </div>

        {/* Data Provenance */}
        <div className="text-[11px] text-slate-500 space-y-1 bg-slate-950/60 p-3 rounded-lg border border-slate-800/50">
          <div>Data Source: <span className="text-slate-400 font-medium">{asset.data_source}</span></div>
          <div>Verification: <span className="text-emerald-400 capitalize font-medium">{asset.data_quality_status}</span></div>
        </div>

        {/* Model Limitations Notice */}
        <div className="bg-amber-950/40 border border-amber-700/40 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-300 leading-relaxed">
              This is a <strong>heuristic screening score</strong>, not a validated engineering assessment.
              Scores use elevation, coastal distance, and wind speed inputs. Field verification required
              before operational decisions.
            </p>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 mt-4">
        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg transition"
        >
          Close Asset Inspector
        </button>
      </div>
    </div>
  );
};
