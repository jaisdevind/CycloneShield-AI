import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  CheckCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';
import { DataSourceItem } from '../types';

export const DataSourcesSettingsPage: React.FC = () => {
  const [sources, setSources] = useState<DataSourceItem[]>([]);
  const [health, setHealth] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);

  // Region configuration
  const [selectedRegion, setSelectedRegion] = useState('andhra_pradesh');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [srcData, healthData] = await Promise.all([
        api.getDataSources(),
        api.getHealth(),
      ]);
      setSources(srcData);
      setHealth(healthData);
    } catch (err) {
      console.error('Failed to load data sources or health:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Database className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Data Catalog, Provenance & Calibration
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Auditable Earth observation catalogs, spatial resolution disclosures, and regional presets.
          </p>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>Refresh Metadata</span>
        </button>
      </div>

      {/* Integration Status KPI Cards */}
      {health && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Core Engine</span>
            <div className="flex items-center space-x-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-sm font-bold text-white">{health.service}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">Status: {health.status}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Google Earth Engine</span>
            <div className="flex items-center space-x-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span className="text-sm font-bold text-white">GEE Python API</span>
            </div>
            <div className="text-[11px] text-cyan-400 mt-1 font-mono">{health.earth_engine_mode}</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Google Gen AI (Gemini)</span>
            <div className="flex items-center space-x-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400"></span>
              <span className="text-sm font-bold text-white">{health.gemini_model}</span>
            </div>
            <div className="text-[11px] text-purple-400 mt-1 font-mono">
              {health.gemini_api_configured ? 'Live API Key Connected' : 'Deterministic Grounded Mode'}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Meteorological Feed</span>
            <div className="flex items-center space-x-2 mt-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span className="text-sm font-bold text-white">IMD Demo Provider</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1 font-mono">Mode: {health.weather_mode}</div>
          </div>
        </div>
      )}

      {/* Regional Preset Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
          Coastal Study Region Configuration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div
            onClick={() => setSelectedRegion('andhra_pradesh')}
            className={`p-3.5 rounded-lg border text-xs cursor-pointer transition ${
              selectedRegion === 'andhra_pradesh'
                ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span>Coastal Andhra Pradesh (Initial Region)</span>
              {selectedRegion === 'andhra_pradesh' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Visakhapatnam, Kakinada, Godavari & Krishna Deltas, Bapatla, Nellore
            </div>
          </div>

          <div
            onClick={() => setSelectedRegion('odisha')}
            className={`p-3.5 rounded-lg border text-xs cursor-pointer transition ${
              selectedRegion === 'odisha'
                ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span>Odisha Coast (Extensible Target)</span>
              {selectedRegion === 'odisha' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Puri, Paradeep, Jagatsinghpur, Balasore coastal belt
            </div>
          </div>

          <div
            onClick={() => setSelectedRegion('tamil_nadu')}
            className={`p-3.5 rounded-lg border text-xs cursor-pointer transition ${
              selectedRegion === 'tamil_nadu'
                ? 'bg-cyan-500/10 border-cyan-500/50 text-white'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between font-bold mb-1">
              <span>North Tamil Nadu (Extensible Target)</span>
              {selectedRegion === 'tamil_nadu' && <CheckCircle className="w-4 h-4 text-cyan-400" />}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Chennai, Ennore Port, Cuddalore, Nagapattinam corridor
            </div>
          </div>
        </div>
      </div>

      {/* Earth Engine Documented Catalog Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg space-y-4 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Earth Observation & Geospatial Dataset Register
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Dataset identifiers, resolutions, intended analytical use, and documented operational limitations.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400">
            {sources.length} Catalogued Datasets
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3">Dataset Name & Identifier</th>
                <th className="py-3 px-3">Custodian</th>
                <th className="py-3 px-3">Spatial / Temporal</th>
                <th className="py-3 px-3">Intended Use</th>
                <th className="py-3 px-3">Documented Limitations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sources.map((src) => (
                <tr key={src.id} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-3">
                    <span className="font-semibold text-white block">{src.name}</span>
                    <span className="text-[11px] font-mono text-cyan-400">{src.dataset_identifier}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300 font-medium">
                    {src.provider}
                  </td>
                  <td className="py-3.5 px-3 font-mono text-[11px] text-slate-300">
                    <div>{src.spatial_resolution}</div>
                    <div className="text-slate-500">{src.temporal_coverage}</div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">
                    {src.intended_use}
                  </td>
                  <td className="py-3.5 px-3 text-[11px] text-slate-400 leading-relaxed max-w-xs">
                    {src.limitations}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
