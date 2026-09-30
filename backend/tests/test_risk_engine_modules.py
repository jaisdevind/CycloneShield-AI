import pytest
from app.services.risk.rainfall_flood import calculate_flood_susceptibility
from app.services.risk.coastal_surge import calculate_coastal_surge_susceptibility
from app.services.risk.wind_exposure import calculate_wind_exposure
from app.services.risk.infrastructure_vulnerability import calculate_asset_vulnerability
from app.services.risk.composite_risk import calculate_composite_risk
from app.services.risk.road_exposure import evaluate_road_hazard_intersection, ROAD_ACCESSIBILITY_DISCLAIMER
from app.services.risk.engine import RiskEngine
from app.schemas.schemas import RiskWeightConfig

def test_flood_susceptibility_formula_and_bounds():
    # Extreme rainfall, low elevation -> high score bounded by 100.0
    score, exp, dq = calculate_flood_susceptibility(
        rainfall_24h_mm=400.0,
        elevation_m=1.0,
        distance_to_waterway_km=0.2,
        land_cover_type="urban"
    )
    assert 0.0 <= score <= 100.0
    assert score >= 80.0
    assert "Rainfall" in exp
    assert dq["status"] == "verified"

    # Zero rainfall, high elevation -> low score
    score_zero, _, _ = calculate_flood_susceptibility(
        rainfall_24h_mm=0.0,
        elevation_m=100.0,
        distance_to_waterway_km=10.0,
        land_cover_type="forest"
    )
    assert score_zero == 0.0

def test_coastal_surge_inland_threshold():
    # >20km inland returns 0.0
    score_inland, exp_inland, dq_inland = calculate_coastal_surge_susceptibility(
        surge_height_m=5.0,
        elevation_m=1.0,
        distance_to_coast_km=25.0
    )
    assert score_inland == 0.0
    assert "inland" in exp_inland.lower()
    assert "inland_beyond_20km" in dq_inland["flags"]

    # Close coast high surge -> high score bounded by 100.0
    score_coastal, exp_coastal, _ = calculate_coastal_surge_susceptibility(
        surge_height_m=4.0,
        elevation_m=1.0,
        distance_to_coast_km=0.5
    )
    assert 0.0 <= score_coastal <= 100.0
    assert score_coastal > 60.0

def test_wind_exposure_decay_and_structure():
    # Eyewall (distance <= 35km) gets full wind speed
    score_eyewall, _, _ = calculate_wind_exposure(
        max_wind_kmh=160.0,
        distance_to_track_km=10.0,
        structural_type="reinforced_concrete"
    )
    
    # Outer radius decay (distance = 100km)
    score_outer, _, dq_outer = calculate_wind_exposure(
        max_wind_kmh=160.0,
        distance_to_track_km=100.0,
        structural_type="reinforced_concrete"
    )
    assert score_eyewall > score_outer
    assert 0.0 <= score_outer <= 100.0

    # Tin roof structure has higher vulnerability multiplier than reinforced concrete
    score_tin, _, _ = calculate_wind_exposure(
        max_wind_kmh=160.0,
        distance_to_track_km=20.0,
        structural_type="tin_roof"
    )
    assert score_tin > score_eyewall

def test_infrastructure_vulnerability_categories():
    # Hospital lifeline has high category factor
    score_hosp, exp_hosp, _ = calculate_asset_vulnerability(
        asset_category="hospital",
        structural_type="reinforced_concrete"
    )
    # Shelter evacuation facility has lower vulnerability factor
    score_shelter, exp_shelter, _ = calculate_asset_vulnerability(
        asset_category="shelter",
        structural_type="reinforced_concrete"
    )
    assert score_hosp > score_shelter
    assert 0.0 <= score_hosp <= 100.0

def test_composite_risk_thresholds_and_weights():
    weights = RiskWeightConfig(flood_weight=0.5, surge_weight=0.3, wind_weight=0.2)
    score, level, summary, meta = calculate_composite_risk(
        flood_score=90.0,
        surge_score=80.0,
        wind_score=70.0,
        weights=weights,
        threshold_high=75
    )
    assert 0.0 <= score <= 100.0
    assert level == "Critical"
    assert meta["thresholds"]["high"] == 75

    # Determinism test
    score2, level2, _, _ = calculate_composite_risk(
        flood_score=90.0,
        surge_score=80.0,
        wind_score=70.0,
        weights=weights,
        threshold_high=75
    )
    assert score == score2
    assert level == level2

def test_road_hazard_intersection_spatial_operations():
    road_line = {
        "type": "LineString",
        "coordinates": [[82.10, 16.90], [82.30, 17.10]]
    }
    hazard_poly = {
        "type": "Polygon",
        "coordinates": [[[82.15, 16.95], [82.25, 16.95], [82.25, 17.05], [82.15, 17.05], [82.15, 16.95]]]
    }

    is_intersecting, hazard_score, exp, meta = evaluate_road_hazard_intersection(
        road_geojson_geometry=road_line,
        hazard_polygons=[{"geometry": hazard_poly, "properties": {"layer_type": "flood_zone", "severity_score": 85.0}}]
    )

    assert is_intersecting is True
    assert hazard_score > 0.0
    assert meta["status"] == "modeled_hazard_intersection"
    assert ROAD_ACCESSIBILITY_DISCLAIMER in exp

def test_risk_engine_orchestrator_full_analysis():
    analysis = RiskEngine.analyze_asset_risk(
        asset_category="hospital",
        elevation_m=5.0,
        distance_to_coast_km=1.5,
        distance_to_track_km=25.0,
        rainfall_24h_mm=300.0,
        surge_height_m=3.0,
        max_wind_kmh=150.0,
        structural_type="reinforced_concrete"
    )
    assert "risk_score" in analysis
    assert "risk_level" in analysis
    assert "flood_score" in analysis
    assert "surge_score" in analysis
    assert "wind_score" in analysis
    assert "vulnerability_score" in analysis
    assert "component_explanations" in analysis
    assert "data_quality_status" in analysis
