import React from 'react';
import {
  MapPin,
  Clock,
  Menu,
  ShieldCheck,
  AlertTriangle,
  Radio
} from 'lucide-react';
import { useHealth } from '../../hooks/useHealth';
import { api } from '../../services/api';
import { CycloneScenario } from '../../types';

interface HeaderProps {
  selectedRegion: string;
  onSelectRegion: (region: string) => void;
  selectedScenarioId: string;
  onSelectScenario: (scenarioId: string) => void;
  onToggleMobileSidebar: () => void;
  lastUpdated?: string;
}

export const Header: React.FC<HeaderProps> = ({
  selectedRegion,
  onSelectRegion,
  selectedScenarioId,
  onSelectScenario,
  onToggleMobileSidebar,
  lastUpdated,
}) => {
  const health = useHealth(15000);
  const [scenarios, setScenarios] = React.useState<{ id: string; label: string }[]>([
    { id: 'varun_2026', label: "Severe Storm 'Varun' (DEMO)" },
    { id: 'michaung_2023', label: "Cyclone 'Michaung' (Historical Dec 2023)" },
  ]);

  React.useEffect(() => {
    api.getCyclones()
      .then((scList: CycloneScenario[]) => {
        if (scList && scList.length > 0) {
          const formatted = scList.map(sc => {
            let badge = "(DEMO)";
            if (sc.category === "historical_baseline" || sc.category === "historical") badge = "(Historical Baseline)";
            else if (sc.category === "synthetic_demo" || sc.category === "hypothetical") badge = "(Synthetic Demo)";
            else if (sc.category === "live_observation" || sc.category === "live") badge = "(LIVE Data)";
            else if (sc.category === "forecast") badge = "(Forecast)";
            return {
              id: sc.id,
              label: `${sc.name} ${badge}`
            };
          });
          setScenarios(formatted);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch cyclone list for header dropdown:", err);
      });
  }, []);

  const regions = [
    { id: 'andhra_pradesh', label: 'Coastal Andhra Pradesh, India' },
    { id: 'odisha', label: 'Odisha Coastal Belt (Extensible)' },
    { id: 'tamil_nadu', label: 'North Tamil Nadu (Extensible)' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      {/* Top Banner: Mandatory Safety Notification */}
      <div className="bg-amber-950/80 border-b border-amber-900/60 px-4 py-1.5 text-xs flex items-center justify-between text-amber-200">
        <div className="flex items-center space-x-2 font-mono">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="font-semibold text-amber-300">OPERATIONAL DEMO MODE:</span>
          <span>Screening Susceptibility Model • Human Review Required Prior to Public Advisory</span>
        </div>

        <div className="flex items-center space-x-2 font-mono text-[11px]">
          {/* Live Data Status Indicator */}
          <div
            className={`flex items-center space-x-1.5 px-2 py-0.5 rounded border ${
              health.isHealthy
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                health.isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span>{health.isHealthy ? 'SYSTEM OPERATIONAL' : 'SYSTEM DEGRADED'}</span>
          </div>
          <span className="text-amber-400/80 hidden lg:inline">Google Code for Communities</span>
        </div>
      </div>

      {/* Main Header Action Bar */}
      <div className="h-14 px-4 flex items-center justify-between gap-4">
        {/* Mobile Hamburger + Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleMobileSidebar}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Region Dropdown Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <select
              aria-label="Target Coastal Region"
              value={selectedRegion}
              onChange={(e) => onSelectRegion(e.target.value)}
              className="bg-transparent font-medium text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              {regions.map((r) => (
                <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Side Controls: Scenario & Data Freshness */}
        <div className="flex items-center space-x-3">
          {/* Scenario Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800 text-xs">
            <span className="text-slate-500 hidden sm:inline">Scenario:</span>
            <select
              aria-label="Disaster Simulation Scenario"
              value={selectedScenarioId}
              onChange={(e) => onSelectScenario(e.target.value)}
              className="bg-transparent font-semibold text-cyan-400 focus:outline-none cursor-pointer"
            >
              {scenarios.map((sc) => (
                <option key={sc.id} value={sc.id} className="bg-slate-900 text-slate-200">
                  {sc.label}
                </option>
              ))}
            </select>
          </div>

          {/* Data Freshness Timestamp */}
          {lastUpdated && (
            <div className="hidden md:flex items-center space-x-1 text-slate-400 text-xs font-mono bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <Clock className="w-3 h-3 text-cyan-400" />
              <span>{new Date(lastUpdated).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
