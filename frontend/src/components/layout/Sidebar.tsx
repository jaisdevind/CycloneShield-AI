import React from 'react';
import {
  Activity,
  Layers,
  Building2,
  Sliders,
  Sparkles,
  FileCheck2,
  Database,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  scenarioName?: string;
  regionName?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  scenarioName = "Severe Storm 'Varun'",
  regionName = "Coastal AP"
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: Activity, badge: 'Live' },
    { id: 'map', label: 'Live Risk Map', icon: Layers, badge: 'GEE' },
    { id: 'infrastructure', label: 'Infrastructure', icon: Building2 },
    { id: 'simulator', label: 'Impact Simulator', icon: Sliders },
    { id: 'copilot', label: 'Gemini Copilot', icon: Sparkles, badge: 'AI' },
    { id: 'advisories', label: 'Advisories & Review', icon: FileCheck2 },
    { id: 'datasources', label: 'Data Sources', icon: Database },
  ];

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between select-none z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Top Brand Logo Section */}
      <div>
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          {!collapsed && (
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="font-bold text-sm tracking-tight text-white flex items-center space-x-1.5">
                  <span>CYCLONESHIELD</span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1 py-0.2 rounded font-mono border border-cyan-500/40">
                    AI
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  Coastal Intel System
                </div>
              </div>
            </div>
          )}

          {collapsed && (
            <div className="mx-auto p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
          )}

          <button
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 hidden md:block transition"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                title={collapsed ? item.label : undefined}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-xs font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!collapsed && item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-semibold uppercase ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-800 text-slate-400 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer Info Box */}
      {!collapsed && (
        <div className="p-3 m-3 bg-slate-950 rounded-xl border border-slate-800/80 space-y-2 text-[11px]">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-semibold text-slate-300">Active Scenario</span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-1 py-0.5 rounded border border-cyan-500/20">
              DEMO
            </span>
          </div>
          <div className="font-medium text-slate-200 truncate">{scenarioName}</div>
          <div className="text-[10px] text-slate-500 font-mono flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Region: {regionName}</span>
          </div>
        </div>
      )}
    </aside>
  );
};
