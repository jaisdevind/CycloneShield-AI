import React from 'react';
import {
  ShieldAlert,
  MapPin,
  Activity,
  Layers,
  Building2,
  Sliders,
  Sparkles,
  FileCheck2,
  Database
} from 'lucide-react';
import { useHealth } from '../hooks/useHealth';

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  activeScenarioName?: string;
  regionName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  activeScenarioName = "Severe Cyclonic Storm 'Varun'",
  regionName = "Coastal Andhra Pradesh"
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'map', label: 'Live Risk Map', icon: Layers },
    { id: 'infrastructure', label: 'Infrastructure', icon: Building2 },
    { id: 'simulator', label: 'Impact Simulator', icon: Sliders },
    { id: 'copilot', label: 'Gemini Copilot', icon: Sparkles },
    { id: 'advisories', label: 'Advisories & Review', icon: FileCheck2 },
    { id: 'datasources', label: 'Data Sources & Settings', icon: Database },
  ];

  const health = useHealth(20000);

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      {/* Top Banner: Mandatory Disaster Platform Disclaimer */}
      <div className="bg-amber-950/80 border-b border-amber-900/60 px-4 py-1.5 text-xs flex items-center justify-between text-amber-200">
        <div className="flex items-center space-x-2 font-mono">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span className="font-semibold text-amber-300">OPERATIONAL DEMO MODE:</span>
          <span>Simulation Active for {regionName} • Heuristic Screening Scores • Human Review Required Before Advisory Publication</span>
        </div>
        
        {/* Live Backend Health Indicator */}
        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <div className="flex items-center space-x-1.5 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700/60">
            <span className={`w-2 h-2 rounded-full ${health.isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-red-500'}`}></span>
            <span className={health.isHealthy ? 'text-emerald-300' : 'text-red-300'}>
              API {health.isHealthy ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <span className="text-amber-300/80 hidden md:block">
            Track 5 Google Code for Communities
          </span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onTabChange('overview')}>
            <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/30 text-cyan-400">
              <ShieldAlert className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold tracking-tight text-white font-sans">CYCLONESHIELD</span>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono px-1.5 py-0.5 rounded">
                  AI v1.0
                </span>
              </div>
              <div className="text-xs text-slate-400 flex items-center space-x-1.5">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span>{regionName}</span>
                <span className="text-slate-600">•</span>
                <span className="text-cyan-400/90 font-medium truncate max-w-[200px]">{activeScenarioName}</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-cyan-400 border border-slate-700 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Navigation Scroll */}
      <div className="lg:hidden flex overflow-x-auto border-t border-slate-800 bg-slate-950/60 px-2 py-1.5 space-x-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs whitespace-nowrap font-medium transition-colors ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
