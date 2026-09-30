import React, { useState } from 'react';
import {
  Wind,
  CloudRain,
  AlertTriangle,
  ShieldCheck,
  Info,
  Clock,
  ChevronRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { OverviewData } from '../types';

interface OverviewPageProps {
  data: OverviewData | null;
  onNavigate: (tab: string) => void;
  onScenarioChange?: (scenarioId: string) => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ data, onNavigate, onScenarioChange }) => {
  const [selectedScenarioId, setSelectedScenarioId] = useState(data?.active_scenario?.id || 'varun_2026');

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400 text-sm">Loading Situational Intelligence Dashboard...</p>
        </div>
      </div>
    );
  }

  const { active_scenario, wind_summary, rainfall_summary, risk_summary_kpi, infrastructure_exposure_kpi } = data;

  const handleScenarioSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedScenarioId(val);
    if (onScenarioChange) {
      onScenarioChange(val);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Situational Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 p-5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Pre-Landfall Emergency Management Dashboard
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Geospatial screening and operational vulnerability synthesis for {data.selected_region.name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Scenario Selector */}
          <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-700/80 flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Scenario:</span>
            <select
              aria-label="Operational Scenario"
              value={selectedScenarioId}
              onChange={handleScenarioSelect}
              className="bg-transparent text-xs font-semibold text-cyan-400 focus:outline-none cursor-pointer"
            >
              <option value="varun_2026">Varun 2026 (Operational Demo)</option>
              <option value="michaung_2023">Michaung 2023 (Historical Baseline)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Updated: <strong className="text-slate-200">{new Date(data.last_data_update).toLocaleTimeString()}</strong></span>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Max Wind */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Max Sustained Wind</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <Wind className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-white font-mono">{wind_summary.max_sustained_kmh}</span>
              <span className="text-sm font-semibold text-slate-400">{wind_summary.units}</span>
            </div>
            <div className="text-xs text-red-400 font-medium mt-1">
              {wind_summary.category}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Storm Speed: {wind_summary.storm_translation_speed_kmh} km/h</span>
            <span>Eye offset: ~35 km</span>
          </div>
        </div>

        {/* 24h Rainfall */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">24h Rainfall Forecast</span>
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <CloudRain className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-white font-mono">{rainfall_summary.forecast_24h_accumulation_mm}</span>
              <span className="text-sm font-semibold text-slate-400">{rainfall_summary.units}</span>
            </div>
            <div className="text-xs text-cyan-400 font-medium mt-1">
              {rainfall_summary.period}
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Ratio: {rainfall_summary.historical_baseline_ratio}</span>
          </div>
        </div>

        {/* Critical Risk Assets */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Critical Risk Facilities</span>
            <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-orange-400 font-mono">
                {risk_summary_kpi.critical_risk_assets + risk_summary_kpi.high_risk_assets}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ {risk_summary_kpi.total_assessed_assets} Total</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {risk_summary_kpi.critical_risk_assets} Critical • {risk_summary_kpi.high_risk_assets} High
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Dominant Threat: Surge & Waterlogging</span>
          </div>
        </div>

        {/* Shelter Capacity */}
        <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Verified Shelter Readiness</span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-bold text-emerald-400 font-mono">
                {infrastructure_exposure_kpi.total_verified_shelter_capacity.toLocaleString()}
              </span>
              <span className="text-sm font-semibold text-slate-400">Evacuees</span>
            </div>
            <div className="text-xs text-emerald-400/90 font-medium mt-1">
              APSDMA Multipurpose Shelters
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex justify-between">
            <span>Hospitals under alert: {infrastructure_exposure_kpi.hospitals_under_critical_warning}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Strategic Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Risk Analysis & Operational Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Storm Overview Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-semibold text-white">Storm Profile & Projected Corridor</h2>
              </div>
              <button
                onClick={() => onNavigate('map')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>Open Live Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {active_scenario.description}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800/80 font-mono text-xs">
              <div>
                <span className="text-slate-500 block">Eye Position</span>
                <span className="text-slate-200 font-semibold">{active_scenario.current_lat.toFixed(2)}°N, {active_scenario.current_lon.toFixed(2)}°E</span>
              </div>
              <div>
                <span className="text-slate-500 block">Central Pressure</span>
                <span className="text-slate-200 font-semibold">{active_scenario.central_pressure_hpa || 974} hPa</span>
              </div>
              <div>
                <span className="text-slate-500 block">Landfall Corridor</span>
                <span className="text-amber-400 font-semibold">Near Kakinada / Godavari Delta</span>
              </div>
            </div>

            {/* Quick Navigation Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <button
                onClick={() => onNavigate('map')}
                className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 text-left transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Interactive Map</span>
                  <span className="text-[11px] text-slate-400">View hazard raster & assets</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigate('simulator')}
                className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 text-left transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-slate-200 block">Impact Simulator</span>
                  <span className="text-[11px] text-slate-400">Tweak wind & rainfall sliders</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => onNavigate('copilot')}
                className="p-3 bg-slate-800/60 hover:bg-slate-800 rounded-lg border border-slate-700/60 text-left transition flex items-center justify-between"
              >
                <div>
                  <span className="text-xs font-semibold text-cyan-300 block">Gemini Copilot</span>
                  <span className="text-[11px] text-slate-400">Ask grounded AI questions</span>
                </div>
                <ChevronRight className="w-4 h-4 text-cyan-500" />
              </button>
            </div>
          </div>

          {/* Model Limitations & Transparency Notice */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center space-x-2 text-amber-400 mb-3">
              <Info className="w-5 h-5" />
              <h2 className="text-base font-semibold text-white">Transparency & Scientific Governance</h2>
            </div>
            <div className="space-y-2 text-xs text-slate-300">
              <p>
                <strong>Operational Screening Heuristic:</strong> The flood, surge, and wind scores displayed in CycloneShield AI are reproducible deterministic screening indicators designed for civil-defense staging. They do not constitute calibrated numerical hydrodynamic SLOSH/ADCIRC predictions.
              </p>
              <p>
                <strong>Human-in-the-Loop Requirement:</strong> Per NDMA guidelines, no public advisory or emergency alert may be disseminated without verification and authorization by the competent disaster management officer.
              </p>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Data Health & Provenance */}
        <div className="space-y-6">
          {/* Data Sources Status */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                <h2 className="text-base font-semibold text-white">Data Pipeline Health</h2>
              </div>
              <button
                onClick={() => onNavigate('datasources')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center"
              >
                <span>Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(data.data_source_health).map(([key, status]) => (
                <div key={key} className="bg-slate-950 p-3 rounded-lg border border-slate-800/80">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ONLINE
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono truncate">{status}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Advisory CTA */}
          <div className="bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-800/40 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">Community Advisory Drafting</h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Generate bilingual emergency preparedness bulletins in English and Telugu for fishermen, public, and district collectors.
            </p>
            <button
              onClick={() => onNavigate('advisories')}
              className="w-full py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1.5"
            >
              <span>Draft Community Advisory</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
