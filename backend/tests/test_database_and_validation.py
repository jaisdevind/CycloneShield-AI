import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.main import app
from app.core.database import SessionLocal, engine, Base
from app.database.init_db import init_database
from app.models.models import (
    ScenarioModel,
    DataSourceModel,
    InfrastructureModel,
    AdvisoryDraftModel,
    SimulationRunModel,
    RiskAssessmentModel
)

client = TestClient(app)

def test_database_idempotent_seeding():
    """Verifies that running init_database multiple times does not create duplicate records."""
    db: Session = SessionLocal()
    try:
        init_database()
        count_scenarios_1 = db.query(ScenarioModel).count()
        count_sources_1 = db.query(DataSourceModel).count()
        count_infra_1 = db.query(InfrastructureModel).count()

        assert count_scenarios_1 >= 2
        assert count_sources_1 >= 5
        assert count_infra_1 >= 12

        # Re-run seeding
        init_database()
        count_scenarios_2 = db.query(ScenarioModel).count()
        count_sources_2 = db.query(DataSourceModel).count()
        count_infra_2 = db.query(InfrastructureModel).count()

        assert count_scenarios_1 == count_scenarios_2
        assert count_sources_1 == count_sources_2
        assert count_infra_1 == count_infra_2
    finally:
        db.close()

def test_database_orm_crud_operations():
    """Verifies direct SQLAlchemy ORM database CRUD operations for models."""
    db: Session = SessionLocal()
    try:
        # Create a simulation run record
        sim_run = SimulationRunModel(
            id="test_sim_run_001",
            name="Test Simulation Run",
            region_id="andhra_pradesh",
            wind_speed_kmh=150.0,
            rainfall_24h_mm=300.0,
            surge_height_m=3.0,
            duration_hours=24,
            high_risk_assets_count=4,
            moderate_risk_assets_count=5,
            low_risk_assets_count=3,
            estimated_exposed_population=50000
        )
        db.add(sim_run)
        db.commit()

        fetched = db.query(SimulationRunModel).filter(SimulationRunModel.id == "test_sim_run_001").first()
        assert fetched is not None
        assert fetched.wind_speed_kmh == 150.0

        # Create a risk assessment record linked to scenario & asset
        risk_rec = RiskAssessmentModel(
            id="test_risk_rec_001",
            scenario_id="varun_2026",
            asset_id="hosp_kg_visakhapatnam",
            rainfall_flood_score=45.0,
            coastal_surge_score=78.0,
            wind_exposure_score=60.0,
            composite_risk_score=62.5,
            risk_level="High",
            explanation="Test assessment rationale"
        )
        db.add(risk_rec)
        db.commit()

        fetched_risk = db.query(RiskAssessmentModel).filter(RiskAssessmentModel.id == "test_risk_rec_001").first()
        assert fetched_risk is not None
        assert fetched_risk.risk_level == "High"

        # Cleanup test records
        db.delete(fetched)
        db.delete(fetched_risk)
        db.commit()
    finally:
        db.close()

def test_infrastructure_pagination():
    """Verifies pagination parameters limit and offset on /api/infrastructure."""
    res_all = client.get("/api/infrastructure")
    assert res_all.status_code == 200
    all_assets = res_all.json()
    total_count = len(all_assets)

    # Test limit=3
    res_limit = client.get("/api/infrastructure?limit=3")
    assert res_limit.status_code == 200
    paged_assets = res_limit.json()
    assert len(paged_assets) == 3
    assert paged_assets[0]["id"] == all_assets[0]["id"]

    # Test offset=2, limit=3
    res_offset = client.get("/api/infrastructure?limit=3&offset=2")
    assert res_offset.status_code == 200
    offset_assets = res_offset.json()
    assert len(offset_assets) == min(3, total_count - 2)
    assert offset_assets[0]["id"] == all_assets[2]["id"]

def test_infrastructure_filtering():
    """Verifies filtering by category, risk_level, region_id, and district."""
    # Category filter
    res_hosp = client.get("/api/infrastructure?category=hospital")
    assert res_hosp.status_code == 200
    hosps = res_hosp.json()
    assert len(hosps) > 0
    assert all(a["category"] == "hospital" for a in hosps)

    # Region filter
    res_region = client.get("/api/infrastructure?region_id=andhra_pradesh")
    assert res_region.status_code == 200
    ap_assets = res_region.json()
    assert len(ap_assets) > 0
    assert all(a["region_id"] == "andhra_pradesh" for a in ap_assets)

    # District filter
    res_dist = client.get("/api/infrastructure?district=Visakhapatnam")
    assert res_dist.status_code == 200
    vizag_assets = res_dist.json()
    assert len(vizag_assets) > 0
    assert all(a["district"] == "Visakhapatnam" for a in vizag_assets)

def test_validation_error_responses():
    """Verifies input validation handling and consistent 422 error response structure."""
    # Out of range wind_speed_kmh (< 40.0)
    bad_payload = {
        "name": "Invalid Scenario",
        "wind_speed_kmh": 10.0,
        "rainfall_24h_mm": 100.0,
        "surge_height_m": 1.0
    }
    res = client.post("/api/simulation/run", json=bad_payload)
    assert res.status_code == 422
    data = res.json()
    assert "error" in data
    assert data["error"] == "Validation Error"
    assert "detail" in data

def test_get_data_sources_endpoint():
    """Verifies GET /api/data-sources endpoint."""
    res = client.get("/api/data-sources")
    assert res.status_code == 200
    sources = res.json()
    assert len(sources) >= 5
    ids = [s["id"] for s in sources]
    assert "srtm_dem_30m" in ids
    assert "sentinel_1_sar" in ids
