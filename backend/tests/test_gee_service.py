import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.services.gee.service import gee_service, GEE_DATASET_CATALOG, DEFAULT_STUDY_BBOX

client = TestClient(app)

def test_gee_service_unconfigured_status():
    """Verifies that GEE service accurately exposes initialization and integration status."""
    status = gee_service.get_status()
    assert "initialized" in status
    assert "auth_method" in status
    assert "mode" in status
    assert "study_region" in status
    assert status["study_region"]["bbox"] == DEFAULT_STUDY_BBOX
    assert len(status["supported_datasets"]) == len(GEE_DATASET_CATALOG)

def test_gee_catalog_metadata():
    """Verifies catalog metadata structure, data_type, resolution, and limitations."""
    catalog = gee_service.get_catalog_metadata()
    assert len(catalog) >= 5

    srtm = next(item for item in catalog if item["id"] == "srtm_dem_30m")
    assert srtm["dataset_identifier"] == "USGS/SRTMGL1_003"
    assert srtm["data_type"] == "static_baseline"
    assert "limitations" in srtm

    s1 = next(item for item in catalog if item["id"] == "sentinel_1_sar")
    assert s1["dataset_identifier"] == "COPERNICUS/S1_GRD"
    assert s1["data_type"] == "retrospective_observation"

def test_gee_status_endpoint():
    """Verifies GET /api/gee/status endpoint."""
    res = client.get("/api/gee/status")
    assert res.status_code == 200
    data = res.json()
    assert "initialized" in data
    assert "mode" in data
    assert "supported_datasets" in data

def test_gee_live_analysis_unconfigured_error():
    """Verifies that requesting live analysis when GEE is unconfigured returns a structured error."""
    payload = {
        "dataset_id": "sentinel_1_sar",
        "start_date": "2023-11-01",
        "end_date": "2023-12-10"
    }

    if not gee_service.initialized:
        res = client.post("/api/gee/analyze", json=payload)
        assert res.status_code == 538
        data = res.json()
        assert "detail" in data
        detail = data["detail"]
        assert detail["status"] == "error"
        assert detail["mode"] == "unconfigured"
        assert detail["error_type"] == "GEE_AUTHENTICATION_REQUIRED"
    else:
        res = client.post("/api/gee/analyze", json=payload)
        assert res.status_code == 200
        data = res.json()
        assert data["status"] in ("success", "no_data")
