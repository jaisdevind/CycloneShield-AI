import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { OverviewPage } from './pages/OverviewPage';
import { LiveRiskMapPage } from './pages/LiveRiskMapPage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { ImpactSimulatorPage } from './pages/ImpactSimulatorPage';
import { GeminiCopilotPage } from './pages/GeminiCopilotPage';
import { CommunityAdvisoriesPage } from './pages/CommunityAdvisoriesPage';
import { DataSourcesSettingsPage } from './pages/DataSourcesSettingsPage';
import { api } from './services/api';
import {
  OverviewData,
  CycloneScenario,
  InfrastructureAsset,
  RiskLayersData
} from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [scenarioId, setScenarioId] = useState<string>('varun_2026');
  const [selectedRegion, setSelectedRegion] = useState<string>('andhra_pradesh');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Application Global State
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null);
  const [activeScenario, setActiveScenario] = useState<CycloneScenario | null>(null);
  const [infrastructureAssets, setInfrastructureAssets] = useState<InfrastructureAsset[]>([]);
  const [riskLayers, setRiskLayers] = useState<RiskLayersData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (targetScenarioId: string) => {
    setLoading(true);
    setError(null);
    try {
      const [ov, sc, assets, layers] = await Promise.all([
        api.getOverview(),
        api.getCycloneById(targetScenarioId),
        api.getInfrastructure(targetScenarioId),
        api.getRiskLayers(targetScenarioId),
      ]);
      setOverviewData(ov);
      setActiveScenario(sc);
      setInfrastructureAssets(assets);
      setRiskLayers(layers);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to connect to CycloneShield backend API.';
      console.error('Data loading error:', err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData(scenarioId);
  }, [scenarioId, loadData]);

  const handleScenarioChange = (newScenarioId: string) => {
    setScenarioId(newScenarioId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex h-screen overflow-hidden font-sans">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — always visible on md+, slide-in on mobile */}
      <div
        className={`fixed md:relative z-30 h-full transition-transform duration-300 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => {
            setCurrentTab(tab);
            setMobileSidebarOpen(false);
          }}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed((c) => !c)}
          scenarioName={activeScenario?.name}
          regionName="Coastal AP"
        />
      </div>

      {/* Right column: Header + Main Content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
          selectedScenarioId={scenarioId}
          onSelectScenario={handleScenarioChange}
          onToggleMobileSidebar={() => setMobileSidebarOpen((o) => !o)}
          lastUpdated={overviewData?.last_data_update}
        />

        {/* Error Banner */}
        {error && (
          <div className="px-4 pt-3">
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => loadData(scenarioId)}
                className="ml-4 px-2 py-1 bg-red-600/30 hover:bg-red-600/50 rounded text-white font-medium whitespace-nowrap"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {currentTab === 'overview' && (
            <OverviewPage
              data={overviewData}
              onNavigate={setCurrentTab}
              onScenarioChange={handleScenarioChange}
            />
          )}

          {currentTab === 'map' && (
            <LiveRiskMapPage
              scenario={activeScenario}
              assets={infrastructureAssets}
              riskLayers={riskLayers}
              loading={loading}
            />
          )}

          {currentTab === 'infrastructure' && (
            <InfrastructurePage
              assets={infrastructureAssets}
              onSelectOnMap={() => setCurrentTab('map')}
            />
          )}

          {currentTab === 'simulator' && <ImpactSimulatorPage />}

          {currentTab === 'copilot' && <GeminiCopilotPage />}

          {currentTab === 'advisories' && <CommunityAdvisoriesPage />}

          {currentTab === 'datasources' && <DataSourcesSettingsPage />}
        </main>
      </div>
    </div>
  );
}

export default App;
