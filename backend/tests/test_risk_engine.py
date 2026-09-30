import pytest
from app.services.risk.engine import RiskEngine
from app.schemas.schemas import RiskWeightConfig

def test_flood_susceptibility_low_lying():
    # Low-lying coastal asset with heavy rainfall
    score, exp = RiskEngine.calculate_flood_susceptibility(
        rainfall_24h_mm=300.0,
        elevation_m=2.0,
        distance_to_waterway_km=0.5,
        land_cover_type="urban"
    )
    assert 70.0 <= score <= 100.0
    assert "Rainfall" in exp

def test_flood_susceptibility_high_elevation():
    # High ground asset with light rainfall
    score, exp = RiskEngine.calculate_flood_susceptibility(
        rainfall_24h_mm=30.0,
        elevation_m=45.0,
        distance_to_waterway_km=4.0,
        land_cover_type="forest"
    )
    assert score < 25.0

def test_surge_susceptibility_coastal_vs_inland():
    # Immediate shoreline asset at low elevation
    coastal_score, exp_c = RiskEngine.calculate_coastal_surge_susceptibility(
        surge_height_m=3.0,
        elevation_m=1.5,
        distance_to_coast_km=0.5
    )
    assert coastal_score >= 50.0

    # Far inland asset (>20km)
    inland_score, exp_i = RiskEngine.calculate_coastal_surge_susceptibility(
        surge_height_m=3.0,
        elevation_m=12.0,
        distance_to_coast_km=25.0
    )
    assert inland_score == 0.0
    assert "inland" in exp_i.lower()

def test_wind_exposure_decay():
    # Eyewall radius (<35km)
    near_score, _ = RiskEngine.calculate_wind_exposure(
        max_wind_kmh=150.0,
        distance_to_track_km=20.0,
        structural_type="reinforced_concrete"
    )
    # Distant peripheral area (140km)
    far_score, _ = RiskEngine.calculate_wind_exposure(
        max_wind_kmh=150.0,
        distance_to_track_km=140.0,
        structural_type="reinforced_concrete"
    )
    assert near_score > far_score

def test_composite_risk_categories():
    comp, level, summary = RiskEngine.calculate_composite_risk(
        flood_score=85.0,
        surge_score=90.0,
        wind_score=80.0
    )
    assert comp >= 75.0
    assert level == "Critical"

    comp_low, level_low, _ = RiskEngine.calculate_composite_risk(
        flood_score=10.0,
        surge_score=5.0,
        wind_score=15.0
    )
    assert comp_low < 25.0
    assert level_low == "Low"
