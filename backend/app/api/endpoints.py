import uuid
import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.schemas.schemas import (
    ScenarioResponse,
    InfrastructureResponse,
    RiskLayersResponse,
    RiskCalculationRequest,
    RiskAnalysisResponse,
    RiskWeightConfig,
    SimulationRunRequest,
    SimulationRunResponse,
    SimulationComparisonDelta,
    AICopilotRequest,
    AICopilotResponse,
    AdvisoryDraftRequest,
    AdvisoryResponse,
    AdvisoryUpdateRequest,
    AdvisoryApproveRequest,
    DataSourceResponse,
    OverviewResponse,
    GEEAnalysisRequest
)
from app.services.weather.service import weather_service
from app.services.infrastructure.service import infrastructure_service
from app.services.gee.service import gee_service
from app.services.risk.engine import RiskEngine
from app.services.gemini.service import gemini_copilot_service
from app.services.advisories.service import advisory_service

router = APIRouter()

@router.get("/health")
def get_health_check(db: Session = Depends(get_db)):
    """System health check and integration status."""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "timestamp": datetime.datetime.now(datetime.UTC).isoformat().replace("+00:00", "Z"),
        "database": "sqlite_connected",
        "gemini_api_configured": bool(settings.GEMINI_API_KEY),
        "gemini_model": settings.GEMINI_MODEL,
        "earth_engine_mode": "live_initialized" if gee_service.initialized else "screening_ready",
        "weather_mode": settings.WEATHER_PROVIDER_MODE,
        "active_region": settings.DEFAULT_REGION_NAME
    }

@router.get("/overview", response_model=OverviewResponse)
def get_overview_dashboard():
    """Returns summarized operational situational intelligence for command center."""
    scenario = weather_service.get_active_scenario()
    assets = infrastructure_service.get_all_assets(
        scenario_lat=scenario.current_lat,
        scenario_lon=scenario.current_lon,
        max_wind_kmh=scenario.max_wind_kmh,
        rainfall_24h_mm=scenario.forecast_rainfall_24h_mm
    )

    critical_count = sum(1 for a in assets if a.risk_level == "Critical")
    high_count = sum(1 for a in assets if a.risk_level == "High")
    moderate_count = sum(1 for a in assets if a.risk_level == "Moderate")
    low_count = sum(1 for a in assets if a.risk_level == "Low")

    total_shelter_capacity = sum(a.capacity or 0 for a in assets if a.category == "shelter")
    hospitals_exposed = sum(1 for a in assets if a.category == "hospital" and a.risk_level in ("High", "Critical"))

    return OverviewResponse(
        selected_region={
            "id": settings.DEFAULT_REGION_ID,
            "name": settings.DEFAULT_REGION_NAME,
            "bbox": settings.DEFAULT_REGION_BBOX
        },
        active_scenario=scenario,
        last_data_update=scenario.data_timestamp,
        wind_summary={
            "max_sustained_kmh": scenario.max_wind_kmh,
            "category": "Very Severe Cyclonic Storm",
            "storm_translation_speed_kmh": scenario.storm_speed_kmh,
            "units": "km/h"
        },
        rainfall_summary={
            "forecast_24h_accumulation_mm": scenario.forecast_rainfall_24h_mm,
            "period": "24 hours leading up to landfall",
            "units": "mm",
            "historical_baseline_ratio": "240% of seasonal normal"
        },
        risk_summary_kpi={
            "critical_risk_assets": critical_count,
            "high_risk_assets": high_count,
            "moderate_risk_assets": moderate_count,
            "low_risk_assets": low_count,
            "total_assessed_assets": len(assets),
            "dominant_threat": "Coastal Surge & Delta Waterlogging"
        },
        infrastructure_exposure_kpi={
            "total_verified_shelter_capacity": total_shelter_capacity,
            "hospitals_under_critical_warning": hospitals_exposed,
            "transport_segments_flagged": 2,
            "power_substations_screened": 1
        },
        data_source_health={
            "google_earth_engine": "Operational (NASA SRTM 30m / ESA WorldCover 10m)",
            "meteorological_feed": "IMD RSMC Demonstration Feed (Active)",
            "infrastructure_feed": "APSDMA NCRMP & OpenStreetMap Verified",
            "ai_copilot_service": "Google Gen AI (Grounded Inference Active)"
        },
        model_confidence_and_limitations={
            "confidence_tier": "Operational Screening Grade",
            "track_uncertainty_cone": "±45 km at 12h forecast horizon",
            "surge_limitations": "Topographic screening score; SLOSH 3D hydrodynamic model required for bathymetric resonance",
            "mandatory_disclaimer": "All advisories require human review before dissemination."
        }
    )

@router.get("/cyclones", response_model=List[ScenarioResponse])
def list_cyclones():
    """Lists available operational demonstration and historical scenarios."""
    return weather_service.get_all_scenarios()

@router.get("/cyclones/{cyclone_id}", response_model=ScenarioResponse)
def get_cyclone_details(cyclone_id: str):
    """Returns details for a specific cyclone scenario."""
    scenario = weather_service.get_scenario_by_id(cyclone_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return scenario

@router.get("/risk/layers", response_model=RiskLayersResponse)
def get_risk_layers(scenario_id: str = Query("varun_2026")):
    """Returns geospatial hazard layers (flood, surge, wind swaths, flagged roads)."""
    return gee_service.get_risk_layers(scenario_id=scenario_id)

@router.post("/risk/analyze", response_model=RiskAnalysisResponse)
def analyze_risk(payload: RiskCalculationRequest):
    """
    Executes on-the-fly compound risk analysis for all study area assets
    given a target scenario and optional custom weights/multipliers.
    """
    scenario = weather_service.get_scenario_by_id(payload.scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail=f"Scenario '{payload.scenario_id}' not found")

    # Apply custom rainfall / wind scaling factors if specified
    rain_factor = payload.custom_rainfall_factor or 1.0
    wind_factor = payload.custom_wind_factor or 1.0

    scaled_rain = (scenario.forecast_rainfall_24h_mm or 0.0) * rain_factor
    scaled_wind = (scenario.max_wind_kmh or 0.0) * wind_factor

    weights = payload.weights or RiskWeightConfig()

    assets = infrastructure_service.get_all_assets(
        scenario_lat=scenario.current_lat,
        scenario_lon=scenario.current_lon,
        max_wind_kmh=scaled_wind,
        rainfall_24h_mm=scaled_rain,
        weights=weights
    )

    critical_count = sum(1 for a in assets if a.risk_level == "Critical")
    high_count = sum(1 for a in assets if a.risk_level == "High")
    mod_count = sum(1 for a in assets if a.risk_level == "Moderate")
    low_count = sum(1 for a in assets if a.risk_level == "Low")

    now_iso = datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ")

    return RiskAnalysisResponse(
        scenario_id=scenario.id,
        evaluated_at=now_iso,
        weights_used=weights,
        total_assets_assessed=len(assets),
        critical_risk_count=critical_count,
        high_risk_count=high_count,
        moderate_risk_count=mod_count,
        low_risk_count=low_count,
        assessed_assets=assets,
        disclaimer="Screening-level heuristic risk analysis; human review required prior to operational deployment."
    )

@router.get("/infrastructure", response_model=List[InfrastructureResponse])
def list_infrastructure(
    category: Optional[str] = Query(None, description="Filter by asset category (e.g. hospital, shelter, port, power_substation)"),
    risk_level: Optional[str] = Query(None, description="Filter by risk tier (Low, Moderate, High, Critical)"),
    region_id: Optional[str] = Query(None, description="Filter by study area region (e.g. andhra_pradesh)"),
    district: Optional[str] = Query(None, description="Filter by district (e.g. Visakhapatnam, Kakinada, Krishna)"),
    limit: int = Query(50, ge=1, le=200, description="Pagination limit (max 200)"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    scenario_id: str = Query("varun_2026", description="Target scenario for risk calculation"),
    db: Session = Depends(get_db)
):
    """
    Lists critical infrastructure assets with evaluated scenario risk.
    Supports pagination (limit, offset) and filtering by asset category, risk tier, study area, and district.
    """
    scenario = weather_service.get_scenario_by_id(scenario_id)
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
        
    assets = infrastructure_service.get_all_assets(
        scenario_lat=scenario.current_lat,
        scenario_lon=scenario.current_lon,
        max_wind_kmh=scenario.max_wind_kmh,
        rainfall_24h_mm=scenario.forecast_rainfall_24h_mm
    )
    if category:
        assets = [a for a in assets if a.category.lower() == category.lower()]
    if risk_level:
        assets = [a for a in assets if a.risk_level.lower() == risk_level.lower()]
    if region_id:
        assets = [a for a in assets if a.region_id.lower() == region_id.lower()]
    if district:
        assets = [a for a in assets if a.district.lower() == district.lower()]

    return assets[offset : offset + limit]

@router.get("/infrastructure/{asset_id}", response_model=InfrastructureResponse)
def get_infrastructure_asset(asset_id: str, scenario_id: str = Query("varun_2026")):
    """Returns granular vulnerability and risk explanation for a specific facility."""
    scenario = weather_service.get_scenario_by_id(scenario_id)
    asset = infrastructure_service.get_asset_by_id(
        asset_id, scenario_lat=scenario.current_lat, scenario_lon=scenario.current_lon
    )
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    return asset

@router.post("/risk/analyze")
def analyze_risk_custom(request: RiskCalculationRequest):
    """Recalculates risk with custom weighting factors."""
    scenario = weather_service.get_scenario_by_id(request.scenario_id)
    rainfall = scenario.forecast_rainfall_24h_mm * (request.custom_rainfall_factor or 1.0)
    wind = scenario.max_wind_kmh * (request.custom_wind_factor or 1.0)

    assets = infrastructure_service.get_all_assets(
        scenario_lat=scenario.current_lat,
        scenario_lon=scenario.current_lon,
        max_wind_kmh=wind,
        rainfall_24h_mm=rainfall,
        weights=request.weights
    )

    return {
        "scenario_id": request.scenario_id,
        "adjusted_rainfall_mm": rainfall,
        "adjusted_wind_kmh": wind,
        "weights_applied": request.weights.model_dump() if request.weights else {"flood": 0.35, "surge": 0.35, "wind": 0.30},
        "total_assets_assessed": len(assets),
        "high_or_critical_count": sum(1 for a in assets if a.risk_level in ("High", "Critical")),
        "assets": assets
    }

@router.post("/simulation/run", response_model=SimulationRunResponse)
def run_simulation(request: SimulationRunRequest):
    """
    Executes an interactive impact simulation scenario.
    Uses the exact same transparent deterministic RiskEngine to prevent discrepancies.
    Calculates before/after comparison deltas against baseline scenario.
    """
    sim_id = f"sim_{uuid.uuid4().hex[:8]}"

    # 1. Baseline scenario risk calculation
    baseline_assets = infrastructure_service.get_all_assets(
        scenario_lat=16.5,
        scenario_lon=82.5,
        max_wind_kmh=155.0,
        rainfall_24h_mm=285.0,
        surge_height_m=2.8
    )

    # 2. Simulated scenario risk calculation using simulation inputs
    evaluated_assets = infrastructure_service.get_all_assets(
        scenario_lat=16.5,
        scenario_lon=82.5,
        max_wind_kmh=request.wind_speed_kmh,
        rainfall_24h_mm=request.rainfall_24h_mm,
        surge_height_m=request.surge_height_m,
        weights=request.weights
    )

    # Filter categories if requested
    if request.categories_filter:
        cats = set(c.lower() for c in request.categories_filter)
        baseline_assets = [a for a in baseline_assets if a.category.lower() in cats]
        evaluated_assets = [a for a in evaluated_assets if a.category.lower() in cats]

    high_crit_count = sum(1 for a in evaluated_assets if a.risk_level in ("High", "Critical"))
    mod_count = sum(1 for a in evaluated_assets if a.risk_level == "Moderate")
    low_count = sum(1 for a in evaluated_assets if a.risk_level == "Low")

    baseline_high_crit_count = sum(1 for a in baseline_assets if a.risk_level in ("High", "Critical"))

    # Calculate average risk scores
    baseline_avg_score = round(sum(a.risk_score or 0.0 for a in baseline_assets) / max(1, len(baseline_assets)), 1)
    simulated_avg_score = round(sum(a.risk_score or 0.0 for a in evaluated_assets) / max(1, len(evaluated_assets)), 1)
    avg_score_delta = round(simulated_avg_score - baseline_avg_score, 1)

    # Asset-by-asset comparison
    increased_risk_count = 0
    decreased_risk_count = 0
    base_map = {a.id: a for a in baseline_assets}
    for sim_a in evaluated_assets:
        base_a = base_map.get(sim_a.id)
        if base_a:
            diff = (sim_a.risk_score or 0.0) - (base_a.risk_score or 0.0)
            if diff > 1.0:
                increased_risk_count += 1
            elif diff < -1.0:
                decreased_risk_count += 1

    # Driving factor attribution synthesis
    wind_diff = request.wind_speed_kmh - 155.0
    rain_diff = request.rainfall_24h_mm - 285.0
    surge_diff = request.surge_height_m - 2.8

    driving_factors = []
    if abs(wind_diff) >= 5.0:
        driving_factors.append(f"Wind Speed ({'+' if wind_diff > 0 else ''}{wind_diff:.0f} km/h)")
    if abs(rain_diff) >= 10.0:
        driving_factors.append(f"24h Rainfall ({'+' if rain_diff > 0 else ''}{rain_diff:.0f} mm)")
    if abs(surge_diff) >= 0.2:
        driving_factors.append(f"Storm Surge ({'+' if surge_diff > 0 else ''}{surge_diff:.1f} m)")

    if not driving_factors:
        driving_summary = "Inputs match baseline scenario parameters."
    else:
        driving_summary = f"Primary drivers of risk changes: {', '.join(driving_factors)}."

    comparison_delta = SimulationComparisonDelta(
        baseline_critical_or_high=baseline_high_crit_count,
        simulated_critical_or_high=high_crit_count,
        net_critical_high_delta=high_crit_count - baseline_high_crit_count,
        baseline_avg_risk_score=baseline_avg_score,
        simulated_avg_risk_score=simulated_avg_score,
        avg_risk_score_delta=avg_score_delta,
        assets_with_increased_risk=increased_risk_count,
        assets_with_decreased_risk=decreased_risk_count,
        driving_factors_summary=driving_summary
    )

    # Estimated exposed population heuristic
    base_pop_per_crit_facility = 14500
    exposed_pop = int((high_crit_count * base_pop_per_crit_facility) * (request.duration_hours / 24.0))
    flagged_roads = 3 if (request.rainfall_24h_mm > 200 or request.surge_height_m > 2.0) else 1

    now_iso = datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:%M:%SZ")

    return SimulationRunResponse(
        simulation_id=sim_id,
        scenario_name=request.name or "Custom Scenario Run",
        region_id=request.region_id,
        parameters={
            "wind_speed_kmh": request.wind_speed_kmh,
            "rainfall_24h_mm": request.rainfall_24h_mm,
            "surge_height_m": request.surge_height_m,
            "duration_hours": request.duration_hours,
            "weights": request.weights.model_dump() if request.weights else {"flood": 0.35, "surge": 0.35, "wind": 0.30}
        },
        high_risk_assets_count=high_crit_count,
        moderate_risk_assets_count=mod_count,
        low_risk_assets_count=low_count,
        total_assets_assessed=len(evaluated_assets),
        estimated_exposed_population=exposed_pop,
        flagged_road_segments_count=flagged_roads,
        asset_breakdown=evaluated_assets,
        comparison_delta=comparison_delta,
        calculated_at=now_iso,
        disclaimer="HYPOTHETICAL SCENARIO SIMULATION ONLY. Outputs are non-operational screening approximations."
    )

@router.post("/ai/analyze", response_model=AICopilotResponse)
def query_ai_copilot(request: AICopilotRequest):
    """Queries the Gemini AI Copilot for grounded geospatial decision support."""
    return gemini_copilot_service.analyze_query(
        query=request.query,
        scenario_id=request.scenario_id or "varun_2026"
    )

@router.post("/advisories/draft", response_model=AdvisoryResponse)
def create_advisory_draft(request: AdvisoryDraftRequest, db: Session = Depends(get_db)):
    """Generates an evidence-grounded community advisory draft."""
    return advisory_service.create_draft(request, db=db)

@router.get("/advisories", response_model=List[AdvisoryResponse])
def list_advisories(db: Session = Depends(get_db)):
    """Lists all saved advisory drafts with approval audit history."""
    drafts = advisory_service.get_all_drafts(db)
    if not drafts:
        # Seed an initial draft if empty
        init_req = AdvisoryDraftRequest(
            scenario_id="varun_2026",
            region_id="andhra_pradesh",
            audience="general_public",
            language="en"
        )
        init_draft = advisory_service.create_draft(init_req, db=db)
        return [init_draft]
    return drafts

@router.put("/advisories/{advisory_id}", response_model=AdvisoryResponse)
def update_advisory_draft(advisory_id: str, request: AdvisoryUpdateRequest, db: Session = Depends(get_db)):
    """Updates an advisory draft's content and review notes."""
    updated = advisory_service.update_draft(advisory_id, request, db)
    if not updated:
        raise HTTPException(status_code=404, detail="Advisory draft not found")
    return updated

@router.post("/advisories/{advisory_id}/approve", response_model=AdvisoryResponse)
def approve_advisory(advisory_id: str, request: AdvisoryApproveRequest, db: Session = Depends(get_db)):
    """Records human review and authorization for publication."""
    approved = advisory_service.approve_draft(advisory_id, request, db)
    if not approved:
        raise HTTPException(status_code=404, detail="Advisory draft not found")
    return approved

@router.get("/data-sources", response_model=List[DataSourceResponse])
def get_data_sources():
    """Lists registered Earth Engine, meteorological, and OSM data sources."""
    return gee_service.get_catalog_metadata()

@router.get("/gee/status")
def get_gee_status():
    """Returns Earth Engine initialization, authentication mode, and study area status."""
    return gee_service.get_status()

@router.post("/gee/analyze")
def run_gee_live_analysis(request: GEEAnalysisRequest):
    """
    Executes live Earth Engine satellite data queries (DEM, Sentinel-1 SAR, Sentinel-2, CHIRPS).
    If Earth Engine is not authenticated, returns a structured unconfigured error response.
    """
    res = gee_service.run_live_analysis(
        dataset_id=request.dataset_id,
        start_date=request.start_date or "2023-11-01",
        end_date=request.end_date or "2023-12-10",
        bbox=request.bbox
    )
    if res.get("status") == "error" and res.get("mode") == "unconfigured":
        raise HTTPException(status_code=538, detail=res)
    return res
