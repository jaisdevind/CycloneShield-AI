from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict
import datetime

class TrackPoint(BaseModel):
    timestamp: str  # ISO 8601 UTC timestamp
    lat: float
    lon: float
    wind_kmh: Optional[float] = None
    pressure_hpa: Optional[float] = None
    category: str  # e.g., "Depression", "Cyclonic Storm", "Severe Cyclonic Storm", "VSCS"
    status: str    # "past_observed", "current", "forecast"
    uncertainty_radius_km: Optional[float] = None
    source: Optional[str] = None

class ForecastCone(BaseModel):
    center_track: List[List[float]]
    cone_polygon: List[List[float]]
    uncertainty_radius_km: List[float]

class ScenarioResponse(BaseModel):
    id: str
    name: str
    category: str  # "live_observation", "forecast", "historical", "hypothetical"
    region_id: str
    description: Optional[str] = None
    is_active: bool
    max_wind_kmh: Optional[float] = None
    wind_unit: str = "km/h"
    central_pressure_hpa: Optional[float] = None
    pressure_unit: str = "hPa"
    forecast_rainfall_24h_mm: Optional[float] = None
    rainfall_unit: str = "mm"
    storm_speed_kmh: Optional[float] = None
    storm_speed_unit: str = "km/h"
    current_lat: float
    current_lon: float
    track_points: List[TrackPoint]
    forecast_cone: Optional[ForecastCone] = None
    source_attribution: str
    data_timestamp: str  # ISO 8601 UTC timestamp
    data_quality_notes: Optional[str] = None
    unavailable_fields: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

class InfrastructureResponse(BaseModel):
    id: str
    name: str
    category: str
    region_id: str
    lat: float
    lon: float
    district: str
    elevation_m: float
    distance_to_coast_km: float
    capacity: Optional[int] = None
    structural_type: Optional[str] = None
    data_source: str
    data_quality_status: str
    
    # Assessed risk scores (optional if not evaluated yet)
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    flood_score: Optional[float] = None
    surge_score: Optional[float] = None
    wind_score: Optional[float] = None
    vulnerability_score: Optional[float] = None
    explanation: Optional[str] = None
    component_explanations: Optional[Dict[str, str]] = None
    data_quality_flags: List[str] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

class RiskWeightConfig(BaseModel):
    flood_weight: float = 0.35
    surge_weight: float = 0.35
    wind_weight: float = 0.30

class RiskCalculationRequest(BaseModel):
    scenario_id: str
    weights: Optional[RiskWeightConfig] = None
    custom_rainfall_factor: Optional[float] = 1.0
    custom_wind_factor: Optional[float] = 1.0

class RiskAnalysisResponse(BaseModel):
    scenario_id: str
    evaluated_at: str
    weights_used: RiskWeightConfig
    total_assets_assessed: int
    critical_risk_count: int
    high_risk_count: int
    moderate_risk_count: int
    low_risk_count: int
    assessed_assets: List[InfrastructureResponse]
    disclaimer: str

class RiskLayerFeature(BaseModel):
    id: str
    type: str = "Feature"
    geometry: Dict[str, Any]
    properties: Dict[str, Any]

class RiskLayersResponse(BaseModel):
    scenario_id: str
    timestamp: str
    region_id: str
    mode: str  # "demo" or "live_earth_engine"
    disclaimer: str
    flood_zones: List[RiskLayerFeature]
    surge_zones: List[RiskLayerFeature]
    wind_swaths: List[RiskLayerFeature]
    composite_zones: List[RiskLayerFeature]
    flagged_road_segments: List[RiskLayerFeature]
    elevation_layers: Optional[List[RiskLayerFeature]] = None
    rainfall_layers: Optional[List[RiskLayerFeature]] = None

class SimulationRunRequest(BaseModel):
    name: Optional[str] = "Simulated Scenario"
    region_id: str = "andhra_pradesh"
    wind_speed_kmh: float = Field(ge=40.0, le=280.0, default=155.0)
    rainfall_24h_mm: float = Field(ge=0.0, le=700.0, default=285.0)
    surge_height_m: float = Field(ge=0.0, le=8.0, default=2.8)
    duration_hours: int = Field(ge=6, le=72, default=24)
    weights: Optional[RiskWeightConfig] = None
    categories_filter: Optional[List[str]] = None

class SimulationComparisonDelta(BaseModel):
    baseline_critical_or_high: int
    simulated_critical_or_high: int
    net_critical_high_delta: int
    baseline_avg_risk_score: float
    simulated_avg_risk_score: float
    avg_risk_score_delta: float
    assets_with_increased_risk: int
    assets_with_decreased_risk: int
    driving_factors_summary: str

class SimulationRunResponse(BaseModel):
    simulation_id: str
    scenario_name: str
    region_id: str = "andhra_pradesh"
    parameters: Dict[str, Any]
    high_risk_assets_count: int
    moderate_risk_assets_count: int
    low_risk_assets_count: int
    total_assets_assessed: int
    estimated_exposed_population: int
    flagged_road_segments_count: int
    asset_breakdown: List[InfrastructureResponse]
    comparison_delta: Optional[SimulationComparisonDelta] = None
    calculated_at: str
    disclaimer: str

class AICopilotRequest(BaseModel):
    query: str
    scenario_id: Optional[str] = "varun_2026"
    region_id: Optional[str] = "andhra_pradesh"
    include_raw_data: Optional[bool] = False

class CopilotFinding(BaseModel):
    title: str
    severity: str  # "critical", "warning", "info"
    detail: str
    evidence_data: List[str]

class AICopilotResponse(BaseModel):
    query: str
    is_ai_generated: bool
    model_identifier: str
    summary: str
    findings: List[CopilotFinding]
    uncertainties: List[str]
    suggested_actions: List[str]
    cited_sources: List[str]
    data_freshness_timestamp: str

class AdvisoryDraftRequest(BaseModel):
    scenario_id: str = "varun_2026"
    region_id: str = "andhra_pradesh"
    audience: str = "general_public"  # 'general_public', 'fishermen', 'collectors_responders', 'port_operators'
    language: str = "en"  # 'en', 'te'

class AdvisoryUpdateRequest(BaseModel):
    title: str
    content: str
    review_notes: Optional[str] = None

class AdvisoryApproveRequest(BaseModel):
    reviewer_name: str
    official_title: str
    review_notes: Optional[str] = None

class AdvisoryResponse(BaseModel):
    id: str
    scenario_id: str
    region_id: str
    audience: str
    language: str
    title: str
    content: str
    evidence_summary: Optional[str] = None
    uncertainty_statement: Optional[str] = None
    status: str
    is_ai_generated: bool = False
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None
    review_notes: Optional[str] = None
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)

    model_config = ConfigDict(from_attributes=True)

class DataSourceResponse(BaseModel):
    id: str
    name: str
    provider: str
    dataset_identifier: str
    description: Optional[str] = None
    spatial_resolution: Optional[str] = None
    temporal_coverage: Optional[str] = None
    update_frequency: Optional[str] = None
    intended_use: Optional[str] = None
    limitations: Optional[str] = None
    status: str
    last_sync: str
    is_live: bool

    model_config = ConfigDict(from_attributes=True)

class OverviewResponse(BaseModel):
    selected_region: Dict[str, Any]
    active_scenario: ScenarioResponse
    last_data_update: str
    wind_summary: Dict[str, Any]
    rainfall_summary: Dict[str, Any]
    risk_summary_kpi: Dict[str, Any]
    infrastructure_exposure_kpi: Dict[str, Any]
    data_source_health: Dict[str, Any]
    model_confidence_and_limitations: Dict[str, Any]

class GEEAnalysisRequest(BaseModel):
    dataset_id: str = Field(default="srtm_dem_30m", description="Dataset identifier (srtm_dem_30m, sentinel_1_sar, sentinel_2_msi, chirps_daily_rain)")
    start_date: Optional[str] = Field(default="2023-11-01", description="Start date (YYYY-MM-DD) for temporal filtering")
    end_date: Optional[str] = Field(default="2023-12-10", description="End date (YYYY-MM-DD) for temporal filtering")
    bbox: Optional[List[float]] = Field(default=None, description="Bounding box [min_lon, min_lat, max_lon, max_lat]")

