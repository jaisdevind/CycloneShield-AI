import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_simulation_run_successful():
    payload = {
        "name": "Heavy Deluge Test Simulation",
        "region_id": "andhra_pradesh",
        "wind_speed_kmh": 175.0,
        "rainfall_24h_mm": 350.0,
        "surge_height_m": 4.0,
        "duration_hours": 36
    }
    response = client.post("/api/simulation/run", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["scenario_name"] == "Heavy Deluge Test Simulation"
    assert data["parameters"]["wind_speed_kmh"] == 175.0
    assert data["parameters"]["rainfall_24h_mm"] == 350.0
    assert data["total_assets_assessed"] > 0
    assert "comparison_delta" in data
    assert "HYPOTHETICAL" in data["disclaimer"]

def test_simulation_deterministic_reproducibility():
    payload = {
        "name": "Deterministic Test",
        "wind_speed_kmh": 160.0,
        "rainfall_24h_mm": 250.0,
        "surge_height_m": 3.0,
        "duration_hours": 24
    }

    res1 = client.post("/api/simulation/run", json=payload).json()
    res2 = client.post("/api/simulation/run", json=payload).json()

    assert res1["high_risk_assets_count"] == res2["high_risk_assets_count"]
    assert res1["estimated_exposed_population"] == res2["estimated_exposed_population"]
    
    scores1 = [a["risk_score"] for a in res1["asset_breakdown"]]
    scores2 = [a["risk_score"] for a in res2["asset_breakdown"]]
    assert scores1 == scores2

def test_simulation_input_sensitivity():
    """Verify that changing wind speed changes the expected output risk scores."""
    low_wind_payload = {
        "wind_speed_kmh": 60.0,
        "rainfall_24h_mm": 50.0,
        "surge_height_m": 0.5,
        "duration_hours": 24
    }
    high_wind_payload = {
        "wind_speed_kmh": 220.0,
        "rainfall_24h_mm": 50.0,
        "surge_height_m": 0.5,
        "duration_hours": 24
    }

    low_res = client.post("/api/simulation/run", json=low_wind_payload).json()
    high_res = client.post("/api/simulation/run", json=high_wind_payload).json()

    assert high_res["high_risk_assets_count"] >= low_res["high_risk_assets_count"]
    assert high_res["comparison_delta"]["simulated_avg_risk_score"] > low_res["comparison_delta"]["simulated_avg_risk_score"]

def test_simulation_validation_errors():
    """Verify that invalid out-of-bound inputs raise FastAPI 422 validation errors."""
    # Wind speed out of bounds (>280)
    bad_wind = {
        "wind_speed_kmh": 350.0,
        "rainfall_24h_mm": 100.0,
        "surge_height_m": 2.0,
        "duration_hours": 24
    }
    res = client.post("/api/simulation/run", json=bad_wind)
    assert res.status_code == 422

    # Rainfall out of bounds (<0)
    bad_rain = {
        "wind_speed_kmh": 100.0,
        "rainfall_24h_mm": -50.0,
        "surge_height_m": 2.0,
        "duration_hours": 24
    }
    res = client.post("/api/simulation/run", json=bad_rain)
    assert res.status_code == 422

def test_simulation_category_filter():
    payload = {
        "wind_speed_kmh": 150.0,
        "rainfall_24h_mm": 200.0,
        "surge_height_m": 2.0,
        "duration_hours": 24,
        "categories_filter": ["hospital"]
    }
    res = client.post("/api/simulation/run", json=payload)
    assert res.status_code == 200
    data = res.json()

    for asset in data["asset_breakdown"]:
        assert asset["category"].lower() == "hospital"
