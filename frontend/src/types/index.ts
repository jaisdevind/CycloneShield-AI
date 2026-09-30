export interface TrackPoint {
  timestamp: string;
  lat: float;
  lon: float;
  wind_kmh: number;
  pressure_hpa?: number;
  category: string;
  status: string;
}

export type float = number;

export interface ForecastCone {
  center_track: [number, number][];
  cone_polygon: [number, number][];
  uncertainty_radius_km: number[];
}

export interface CycloneScenario {
  id: string;
  name: string;
  category: string;
  region_id: string;
  description?: string;
  is_active: boolean;
  max_wind_kmh?: number;
  wind_unit?: string;
  central_pressure_hpa?: number;
  pressure_unit?: string;
  forecast_rainfall_24h_mm?: number;
  rainfall_unit?: string;
  storm_speed_kmh?: number;
  storm_speed_unit?: string;
  current_lat: number;
  current_lon: number;
  track_points: TrackPoint[];
  forecast_cone?: ForecastCone;
  source_attribution: string;
  data_timestamp: string;
  data_quality_notes?: string;
  unavailable_fields?: string[];
}

export interface InfrastructureAsset {
  id: string;
  name: string;
  category: 'hospital' | 'shelter' | 'road' | 'bridge' | 'power_substation' | 'port';
  region_id: string;
  lat: number;
  lon: number;
  district: string;
  elevation_m: number;
  distance_to_coast_km: number;
  capacity?: number;
  structural_type?: string;
  data_source: string;
  data_quality_status: string;
  risk_score?: number;
  risk_level?: 'Low' | 'Moderate' | 'High' | 'Critical';
  flood_score?: number;
  surge_score?: number;
  wind_score?: number;
  explanation?: string;
}

export interface RiskLayerFeature {
  id: string;
  type: string;
  geometry: {
    type: string;
    coordinates: any;
  };
  properties: Record<string, any>;
}

export interface RiskLayersData {
  scenario_id: string;
  timestamp: string;
  region_id: string;
  mode: string;
  disclaimer: string;
  flood_zones: RiskLayerFeature[];
  surge_zones: RiskLayerFeature[];
  wind_swaths: RiskLayerFeature[];
  composite_zones: RiskLayerFeature[];
  flagged_road_segments: RiskLayerFeature[];
  elevation_layers?: RiskLayerFeature[];
  rainfall_layers?: RiskLayerFeature[];
}

export interface OverviewData {
  selected_region: {
    id: string;
    name: string;
    bbox: {
      min_lat: number;
      max_lat: number;
      min_lon: number;
      max_lon: number;
      center_lat: number;
      center_lon: number;
      zoom: number;
    };
  };
  active_scenario: CycloneScenario;
  last_data_update: string;
  wind_summary: {
    max_sustained_kmh: number;
    category: string;
    storm_translation_speed_kmh: number;
    units: string;
  };
  rainfall_summary: {
    forecast_24h_accumulation_mm: number;
    period: string;
    units: string;
    historical_baseline_ratio: string;
  };
  risk_summary_kpi: {
    critical_risk_assets: number;
    high_risk_assets: number;
    moderate_risk_assets: number;
    low_risk_assets: number;
    total_assessed_assets: number;
    dominant_threat: string;
  };
  infrastructure_exposure_kpi: {
    total_verified_shelter_capacity: number;
    hospitals_under_critical_warning: number;
    transport_segments_flagged: number;
    power_substations_screened: number;
  };
  data_source_health: Record<string, string>;
  model_confidence_and_limitations: Record<string, string>;
}

export interface SimulationComparisonDelta {
  baseline_critical_or_high: number;
  simulated_critical_or_high: number;
  net_critical_high_delta: number;
  baseline_avg_risk_score: number;
  simulated_avg_risk_score: number;
  avg_risk_score_delta: number;
  assets_with_increased_risk: number;
  assets_with_decreased_risk: number;
  driving_factors_summary: string;
}

export interface SimulationResult {
  simulation_id: string;
  scenario_name: string;
  region_id?: string;
  parameters: Record<string, any>;
  high_risk_assets_count: number;
  moderate_risk_assets_count: number;
  low_risk_assets_count: number;
  total_assets_assessed: number;
  estimated_exposed_population: number;
  flagged_road_segments_count: number;
  asset_breakdown: InfrastructureAsset[];
  comparison_delta?: SimulationComparisonDelta;
  calculated_at: string;
  disclaimer: string;
}

export interface AICopilotFinding {
  title: string;
  severity: 'critical' | 'warning' | 'info';
  detail: string;
  evidence_data: string[];
}

export interface AICopilotResponse {
  query: string;
  is_ai_generated: boolean;
  model_identifier: string;
  summary: string;
  findings: AICopilotFinding[];
  uncertainties: string[];
  suggested_actions: string[];
  cited_sources: string[];
  data_freshness_timestamp: string;
}

export interface AdvisoryItem {
  id: string;
  scenario_id: string;
  region_id: string;
  audience: 'general_public' | 'fishermen' | 'collectors_responders' | 'port_operators';
  language: 'en' | 'te';
  title: string;
  content: string;
  evidence_summary?: string;
  uncertainty_statement?: string;
  status: 'draft' | 'in_review' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DataSourceItem {
  id: string;
  name: string;
  provider: string;
  dataset_identifier: string;
  description?: string;
  spatial_resolution?: string;
  temporal_coverage?: string;
  update_frequency?: string;
  intended_use?: string;
  limitations?: string;
  status: string;
  last_sync: string;
  is_live: boolean;
}
