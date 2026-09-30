import React, { useState, useEffect, useCallback } from 'react';
import {
  Sliders,
  Play,
  RotateCcw,
  AlertTriangle,
  Users,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Save,
  Bookmark,
  TrendingUp,
  TrendingDown,
  MapPin,
  Info,
  Filter
} from 'lucide-react';
import { api } from '../services/api';
import { SimulationResult } from '../types';

interface SavedSimulationConfig {
  id: string;
  name: string;
  timestamp: string;
  windSpeed: number;
  rainfall: number;
  surgeHeight: number;
  duration: number;
  studyArea: string;
  weights: { flood_weight: number; surge_weight: number; wind_weight: number };
  categories: string[];
}

const CATEGORY_OPTIONS = [
  { id: 'hospital', label: 'Hospitals' },
  { id: 'shelter', label: 'Cyclone Shelters' },
  { id: 'power_substation', label: 'Power Substations' },
  { id: 'port', label: 'Ports & Terminals' },
  { id: 'bridge', label: 'Bridges' },
  { id: 'road', label: 'Road Segments' },
];

const STUDY_AREAS = [
  { id: 'andhra_pradesh', label: 'Coastal Andhra Pradesh (Entire Region)' },
  { id: 'godavari_kakinada', label: 'Godavari Delta & Kakinada Corridor' },
  { id: 'visakhapatnam', label: 'Visakhapatnam Metropolitan & Port Area' },
];

export const ImpactSimulatorPage: React.FC = () => {
  // Simulator inputs
  const [scenarioName, setScenarioName] = useState('Custom Cyclone Landfall Simulation');
  const [studyArea, setStudyArea] = useState('andhra_pradesh');
  const [windSpeed, setWindSpeed] = useState<number>(165);
  const [rainfall, setRainfall] = useState<number>(320);
  const [surgeHeight, setSurgeHeight] = useState<number>(3.5);
  const [duration, setDuration] = useState<number>(24);

  // Custom component weights (0-1 floats)
  const [floodWeight, setFloodWeight] = useState<number>(0.35);
  const [surgeWeight, setSurgeWeight] = useState<number>(0.35);
  const [windWeight, setWindWeight] = useState<number>(0.30);

  // Infrastructure category filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'hospital', 'shelter', 'power_substation', 'port', 'bridge', 'road'
  ]);

  // States
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [savedConfigs, setSavedConfigs] = useState<SavedSimulationConfig[]>([]);
  const [viewMode, setViewMode] = useState<'comparison' | 'breakdown'>('comparison');

  const validateInputs = (): boolean => {
    if (windSpeed < 40 || windSpeed > 280) {
      setValidationError('Wind speed must be between 40 km/h and 280 km/h.');
      return false;
    }
    if (rainfall < 0 || rainfall > 700) {
      setValidationError('24h Rainfall accumulation must be between 0 mm and 700 mm.');
      return false;
    }
    if (surgeHeight < 0 || surgeHeight > 8.0) {
      setValidationError('Storm surge height must be between 0.0 m and 8.0 m.');
      return false;
    }
    if (duration < 6 || duration > 72) {
      setValidationError('Simulation duration must be between 6 and 72 hours.');
      return false;
    }
    if (selectedCategories.length === 0) {
      setValidationError('Please select at least one infrastructure category.');
      return false;
    }
    setValidationError(null);
    return true;
  };

  const handleRunSimulation = useCallback(async () => {
    if (!validateInputs()) return;

    setLoading(true);
    try {
      const res = await api.runSimulation({
        name: scenarioName,
        region_id: studyArea,
        wind_speed_kmh: windSpeed,
        rainfall_24h_mm: rainfall,
        surge_height_m: surgeHeight,
        duration_hours: duration,
        weights: {
          flood_weight: floodWeight,
          surge_weight: surgeWeight,
          wind_weight: windWeight
        },
        categories_filter: selectedCategories
      });
      setResult(res);
    } catch (err: any) {
      console.error('Simulation execution error:', err);
      setValidationError(err.message || 'Failed to execute impact simulation backend request.');
    } finally {
      setLoading(false);
    }
  }, [scenarioName, studyArea, windSpeed, rainfall, surgeHeight, duration, floodWeight, surgeWeight, windWeight, selectedCategories]);

  const handleReset = () => {
    setScenarioName('Baseline Storm Varun Scenario');
    setStudyArea('andhra_pradesh');
    setWindSpeed(155);
    setRainfall(285);
    setSurgeHeight(2.8);
    setDuration(24);
    setFloodWeight(0.35);
    setSurgeWeight(0.35);
    setWindWeight(0.30);
    setSelectedCategories(['hospital', 'shelter', 'power_substation', 'port', 'bridge', 'road']);
    setValidationError(null);
  };

  const handleSaveConfig = () => {
    const newConfig: SavedSimulationConfig = {
      id: `config_${Date.now()}`,
      name: scenarioName || `Sim ${windSpeed}km/h - ${rainfall}mm`,
      timestamp: new Date().toLocaleTimeString(),
      windSpeed,
      rainfall,
      surgeHeight,
      duration,
      studyArea,
      weights: { flood_weight: floodWeight, surge_weight: surgeWeight, wind_weight: windWeight },
      categories: [...selectedCategories]
    };
    setSavedConfigs([newConfig, ...savedConfigs]);
  };

  const handleLoadConfig = (config: SavedSimulationConfig) => {
    setScenarioName(config.name);
    setWindSpeed(config.windSpeed);
    setRainfall(config.rainfall);
    setSurgeHeight(config.surgeHeight);
    setDuration(config.duration);
    setStudyArea(config.studyArea);
    setFloodWeight(config.weights.flood_weight);
    setSurgeWeight(config.weights.surge_weight);
    setWindWeight(config.weights.wind_weight);
    setSelectedCategories(config.categories);
  };

  const toggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      setSelectedCategories(selectedCategories.filter(c => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  // Run initial simulation on mount
  useEffect(() => {
    handleRunSimulation();
  }, [handleRunSimulation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Mandatory Simulation Safety & Disclaimer Label */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Sliders className="w-6 h-6 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Interactive Hazard & Impact Simulator
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Explore "what-if" compound cyclone landfall scenarios with transparent, deterministic risk equations.
          </p>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/30 px-3 py-2 rounded-lg text-amber-300 text-xs font-mono flex items-center space-x-2 shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <span className="font-semibold block text-amber-200">HYPOTHETICAL SIMULATION MODE</span>
            <span className="text-[10px] text-amber-300/80">Slider values are simulation inputs, NOT live weather forecasts.</span>
          </div>
        </div>
      </div>

      {/* Validation Error Alert Box */}
      {validationError && (
        <div className="bg-red-500/10 border border-red-500/30 px-4 py-3 rounded-xl text-red-300 text-xs flex items-center justify-between font-mono">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
          <button onClick={() => setValidationError(null)} className="text-red-400 hover:text-white underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Parameter Controls (Left 1 Col) vs Simulation Results (Right 2 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Input Parameter Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Simulation Inputs</h2>
            <button
              onClick={handleReset}
              className="text-xs text-slate-400 hover:text-cyan-400 flex items-center space-x-1 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Baseline</span>
            </button>
          </div>

          {/* Scenario Name */}
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium block">Scenario Title</label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Study Area Selector */}
          <div className="space-y-1">
            <label className="text-xs text-slate-300 font-medium block flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Target Study Area</span>
            </label>
            <select
              value={studyArea}
              onChange={(e) => setStudyArea(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 cursor-pointer"
            >
              {STUDY_AREAS.map((area) => (
                <option key={area.id} value={area.id} className="bg-slate-900 text-slate-200">
                  {area.label}
                </option>
              ))}
            </select>
          </div>

          {/* Wind Speed Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Max Sustained Wind</span>
              <span className="font-mono text-cyan-400 font-bold">{windSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="40"
              max="280"
              step="5"
              value={windSpeed}
              onChange={(e) => setWindSpeed(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>40 km/h (Depression)</span>
              <span>280 km/h (Super Cyclone)</span>
            </div>
          </div>

          {/* Rainfall Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">24h Rainfall Accumulation</span>
              <span className="font-mono text-cyan-400 font-bold">{rainfall} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="700"
              step="10"
              value={rainfall}
              onChange={(e) => setRainfall(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0 mm</span>
              <span>700 mm (Extreme Deluge)</span>
            </div>
          </div>

          {/* Surge Height Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Peak Storm Surge</span>
              <span className="font-mono text-cyan-400 font-bold">{surgeHeight.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="8.0"
              step="0.2"
              value={surgeHeight}
              onChange={(e) => setSurgeHeight(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>0.0 m (Normal Tide)</span>
              <span>8.0 m (Catastrophic Surge)</span>
            </div>
          </div>

          {/* Scenario Duration */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Scenario Duration</span>
              <span className="font-mono text-cyan-400 font-bold">{duration} hours</span>
            </div>
            <input
              type="range"
              min="6"
              max="72"
              step="6"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>6 hrs (Fast Transit)</span>
              <span>72 hrs (Stalled Storm)</span>
            </div>
          </div>

          {/* Infrastructure Categories Filter */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
              <Filter className="w-3 h-3 text-cyan-400" />
              <span>Target Infrastructure Categories</span>
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {CATEGORY_OPTIONS.map((cat) => {
                const checked = selectedCategories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.id)}
                    className={`px-2.5 py-1.5 rounded-lg border text-left flex items-center space-x-1.5 transition ${
                      checked
                        ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-sm border flex items-center justify-center ${checked ? 'border-cyan-400 bg-cyan-500' : 'border-slate-600'}`}>
                      {checked && <CheckCircle2 className="w-3 h-3 text-slate-950" />}
                    </div>
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Run & Save Actions */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Scenario Simulation</span>
                </>
              )}
            </button>

            <button
              onClick={handleSaveConfig}
              className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-xs font-semibold transition flex items-center justify-center space-x-1.5"
            >
              <Save className="w-3.5 h-3.5 text-slate-400" />
              <span>Save Scenario Preset</span>
            </button>
          </div>

          {/* Saved Configurations Preset History */}
          {savedConfigs.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block flex items-center space-x-1">
                <Bookmark className="w-3 h-3 text-cyan-400" />
                <span>Saved Presets ({savedConfigs.length})</span>
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {savedConfigs.map((cfg) => (
                  <div
                    key={cfg.id}
                    onClick={() => handleLoadConfig(cfg)}
                    className="p-2 bg-slate-950 border border-slate-800/80 rounded-lg hover:border-cyan-500/50 cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <span className="font-semibold text-slate-200 block truncate max-w-[170px]">{cfg.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">{cfg.windSpeed}km/h · {cfg.rainfall}mm · {cfg.surgeHeight}m</span>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-mono">Load</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Simulation Results & Comparison Views */}
        <div className="lg:col-span-2 space-y-5">
          {result && (
            <>
              {/* Tab Navigation: Before/After Comparison vs Asset Breakdown */}
              <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-1.5 rounded-xl text-xs font-medium">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setViewMode('comparison')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      viewMode === 'comparison'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Before/After Baseline Comparison
                  </button>
                  <button
                    onClick={() => setViewMode('breakdown')}
                    className={`px-3 py-1.5 rounded-lg transition ${
                      viewMode === 'breakdown'
                        ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Simulated Asset Breakdown ({result.total_assets_assessed})
                  </button>
                </div>

                <span className="text-[11px] font-mono text-slate-500 px-2 hidden sm:inline">
                  Sim ID: {result.simulation_id}
                </span>
              </div>

              {/* VIEW 1: BEFORE / AFTER COMPARISON VIEW */}
              {viewMode === 'comparison' && (
                <div className="space-y-5">
                  {/* Before / After KPI Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* KPI 1: High/Critical Risk Facilities Delta */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="text-xs text-slate-400 flex items-center justify-between">
                        <span>Critical/High Facilities</span>
                        <ShieldAlert className="w-4 h-4 text-red-400" />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-white font-mono">{result.high_risk_assets_count}</span>
                        {result.comparison_delta && (
                          <span className={`text-xs font-mono font-bold flex items-center ${
                            result.comparison_delta.net_critical_high_delta > 0
                              ? 'text-red-400'
                              : result.comparison_delta.net_critical_high_delta < 0
                              ? 'text-emerald-400'
                              : 'text-slate-400'
                          }`}>
                            {result.comparison_delta.net_critical_high_delta > 0 ? (
                              <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
                            ) : result.comparison_delta.net_critical_high_delta < 0 ? (
                              <TrendingDown className="w-3.5 h-3.5 mr-0.5 inline" />
                            ) : null}
                            {result.comparison_delta.net_critical_high_delta > 0 ? `+${result.comparison_delta.net_critical_high_delta}` : result.comparison_delta.net_critical_high_delta} vs baseline
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Baseline count: {result.comparison_delta?.baseline_critical_or_high ?? '—'}
                      </div>
                    </div>

                    {/* KPI 2: Average Risk Score Delta */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="text-xs text-slate-400 flex items-center justify-between">
                        <span>Average Region Risk Score</span>
                        <Users className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-amber-400 font-mono">
                          {result.comparison_delta?.simulated_avg_risk_score.toFixed(1) ?? '—'}
                        </span>
                        {result.comparison_delta && (
                          <span className={`text-xs font-mono font-bold ${
                            result.comparison_delta.avg_risk_score_delta > 0 ? 'text-red-400' : 'text-emerald-400'
                          }`}>
                            {result.comparison_delta.avg_risk_score_delta > 0 ? `+${result.comparison_delta.avg_risk_score_delta.toFixed(1)}` : `${result.comparison_delta.avg_risk_score_delta.toFixed(1)}`} pts
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Baseline score: {result.comparison_delta?.baseline_avg_risk_score.toFixed(1) ?? '—'}/100
                      </div>
                    </div>

                    {/* KPI 3: Potentially Disrupted Road Segments */}
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="text-xs text-slate-400 flex items-center justify-between">
                        <span>Exposed Road Segments</span>
                        <AlertTriangle className="w-4 h-4 text-orange-400" />
                      </div>
                      <div className="text-3xl font-bold text-orange-400 font-mono">
                        {result.flagged_road_segments_count}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Modeled hazard intersections
                      </div>
                    </div>
                  </div>

                  {/* Driving Factor Analysis Box */}
                  <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block flex items-center space-x-1">
                      <Info className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                      <span>Input Sensitivity & Risk Attribution</span>
                    </span>
                    <p className="text-xs text-slate-300 leading-relaxed font-mono">
                      {result.comparison_delta?.driving_factors_summary ?? 'Scenario inputs match baseline parameters.'}
                    </p>
                    <div className="text-[11px] text-slate-400 pt-1">
                      {result.comparison_delta?.assets_with_increased_risk} assets shifted to higher risk scores; {result.comparison_delta?.assets_with_decreased_risk} assets shifted lower.
                    </div>
                  </div>

                  {/* Top Changed Facilities Table */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-white">Facility Risk Scores Under Simulation</h3>
                      <span className="text-xs font-mono text-slate-400">Showing {result.asset_breakdown.length} facilities</span>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {result.asset_breakdown.map((asset) => (
                        <div
                          key={asset.id}
                          className="bg-slate-950 p-3 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs"
                        >
                          <div className="space-y-0.5">
                            <span className="font-semibold text-white block">{asset.name}</span>
                            <div className="text-slate-400 flex items-center space-x-2">
                              <span className="capitalize">{asset.category.replace('_', ' ')}</span>
                              <span>•</span>
                              <span>{asset.district}</span>
                              <span>•</span>
                              <span>{asset.distance_to_coast_km}km coast</span>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3 font-mono">
                            <div className="text-right hidden sm:block">
                              <div className="text-[11px] text-slate-500">
                                Flood: {asset.flood_score?.toFixed(0)} | Surge: {asset.surge_score?.toFixed(0)} | Wind: {asset.wind_score?.toFixed(0)}
                              </div>
                            </div>
                            <span
                              className={`px-2.5 py-1 rounded text-xs font-bold ${
                                asset.risk_level === 'Critical'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                  : asset.risk_level === 'High'
                                  ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                                  : asset.risk_level === 'Moderate'
                                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                              }`}
                            >
                              {asset.risk_score?.toFixed(0)}/100
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: GRANULAR ASSET BREAKDOWN VIEW */}
              {viewMode === 'breakdown' && (
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-white">Detailed Component Scores & Rationale</h3>
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                    {result.asset_breakdown.map((asset) => (
                      <div key={asset.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-bold text-white text-sm">{asset.name}</span>
                            <span className="text-xs text-slate-400 block capitalize">
                              {asset.category.replace('_', ' ')} · {asset.district} District · Elev: {asset.elevation_m}m
                            </span>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                              asset.risk_level === 'Critical'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : asset.risk_level === 'High'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                                : asset.risk_level === 'Moderate'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            }`}
                          >
                            {asset.risk_level} ({asset.risk_score?.toFixed(1)}/100)
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono bg-slate-900 p-2 rounded-lg border border-slate-800/80">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Flood Score</span>
                            <span className="text-cyan-400 font-bold">{asset.flood_score?.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Surge Score</span>
                            <span className="text-fuchsia-400 font-bold">{asset.surge_score?.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Wind Score</span>
                            <span className="text-red-400 font-bold">{asset.wind_score?.toFixed(1)}</span>
                          </div>
                        </div>

                        {asset.explanation && (
                          <p className="text-[11px] text-slate-300 leading-relaxed font-sans bg-slate-900/50 p-2 rounded border border-slate-800/50">
                            {asset.explanation}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Assumptions & Limitations Box */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-400 space-y-2">
                <span className="font-semibold text-slate-200 block flex items-center space-x-1">
                  <HelpCircle className="w-4 h-4 text-cyan-400 mr-1" />
                  <span>Simulator Model Assumptions & Limitations:</span>
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>Uses the exact same transparent deterministic formulas as the primary risk engine orchestrator.</li>
                  <li>Wind field decay follows radial Holland eyewall vortex model; surge susceptibility accounts for topobathy elevation deficit.</li>
                  <li>Road accessibility identifies modeled hazard extent intersections; it does NOT verify live transit closures without field sensor status.</li>
                  <li>Screening-level heuristic index; does NOT represent calibrated structural engineering failure probabilities.</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
