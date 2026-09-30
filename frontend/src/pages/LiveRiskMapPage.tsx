import React from 'react';
import { CycloneScenario, InfrastructureAsset, RiskLayersData } from '../types';
import { RiskMapCanvas } from '../features/risk-map/RiskMapCanvas';

interface LiveRiskMapPageProps {
  scenario: CycloneScenario | null;
  assets: InfrastructureAsset[];
  riskLayers: RiskLayersData | null;
  loading?: boolean;
}

export const LiveRiskMapPage: React.FC<LiveRiskMapPageProps> = ({
  scenario,
  assets,
  riskLayers,
  loading = false,
}) => {
  return (
    <div className="h-[calc(100vh-120px)] w-full overflow-hidden bg-slate-950">
      <RiskMapCanvas
        scenario={scenario}
        assets={assets}
        riskLayers={riskLayers}
        loading={loading}
      />
    </div>
  );
};

export default LiveRiskMapPage;
