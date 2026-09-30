import React from 'react';
import { Layers, RefreshCw, ZoomIn, ZoomOut } from 'lucide-react';

interface LayerToggleConfig {
  id: string;
  label: string;
  colorClass: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  source?: string;
  timestamp?: string;
  isDemo?: boolean;
}

interface MapLayerControlsProps {
  layers: LayerToggleConfig[];
  basemap: 'dark' | 'satellite' | 'street';
  onBasemapChange: (basemap: 'dark' | 'satellite' | 'street') => void;
  onResetView: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  currentZoom: number;
}

function formatTimestamp(iso?: string): string {
  if (!iso) return 'Unknown';
  try {
    return new Date(iso).toUTCString();
  } catch {
    return iso;
  }
}

export const MapLayerControls: React.FC<MapLayerControlsProps> = ({
  layers,
  basemap,
  onBasemapChange,
  onResetView,
  onZoomIn,
  onZoomOut,
  currentZoom,
}) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur border border-slate-700 rounded-xl p-3 shadow-2xl w-[270px] text-xs">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-2">
        <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          <span>Geospatial Overlays</span>
        </span>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onZoomOut}
            title="Zoom out"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <span className="text-[10px] font-mono text-slate-400">{currentZoom}z</span>
          <button
            onClick={onZoomIn}
            title="Zoom in"
            className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200 transition"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
          <button
            onClick={onResetView}
            title="Reset map view"
            className="flex items-center space-x-1 text-[10px] text-cyan-400 hover:text-cyan-300 font-mono ml-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Layer List */}
      <div className="space-y-0.5 max-h-[320px] overflow-y-auto pr-1">
        {layers.map((layer) => (
          <div key={layer.id} className="space-y-1 py-1.5 border-b border-slate-800/60 last:border-0">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="flex items-center space-x-1.5 text-slate-300 text-[11px]">
                <span className={`w-2.5 h-2.5 rounded-sm ${layer.colorClass} inline-block shrink-0`} />
                <span>{layer.label}</span>
                {layer.isDemo && (
                  <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1 rounded">
                    DEMO
                  </span>
                )}
              </span>
              <input
                type="checkbox"
                checked={layer.checked}
                onChange={(e) => layer.onChange(e.target.checked)}
                className="rounded accent-cyan-500 ml-2 shrink-0"
              />
            </label>

            {layer.checked && (
              <div className="flex items-center space-x-2 pl-4">
                <span className="text-[10px] text-slate-500 shrink-0">Opacity</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={Math.round(layer.opacity * 100)}
                  onChange={(e) => layer.onOpacityChange(Number(e.target.value) / 100)}
                  className="flex-1 h-1 accent-cyan-500 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 font-mono w-7 text-right shrink-0">
                  {Math.round(layer.opacity * 100)}%
                </span>
              </div>
            )}

            {layer.checked && (layer.source || layer.timestamp) && (
              <div className="pl-4 text-[10px] text-slate-600 space-y-0.5">
                {layer.source && <div>Source: <span className="text-slate-500">{layer.source}</span></div>}
                {layer.timestamp && <div>Updated: <span className="text-slate-500">{formatTimestamp(layer.timestamp)}</span></div>}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Basemap Switcher */}
      <div className="pt-2 border-t border-slate-800 flex items-center justify-between mt-1">
        <span className="text-[10px] text-slate-400">Basemap:</span>
        <div className="flex space-x-1">
          <button
            onClick={() => onBasemapChange('dark')}
            className={`px-2 py-0.5 rounded text-[10px] transition ${
              basemap === 'dark' ? 'bg-cyan-600 text-white font-medium' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Dark
          </button>
          <button
            onClick={() => onBasemapChange('satellite')}
            className={`px-2 py-0.5 rounded text-[10px] transition ${
              basemap === 'satellite' ? 'bg-cyan-600 text-white font-medium' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => onBasemapChange('street')}
            className={`px-2 py-0.5 rounded text-[10px] transition ${
              basemap === 'street' ? 'bg-cyan-600 text-white font-medium' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            Street
          </button>
        </div>
      </div>
    </div>
  );
};
