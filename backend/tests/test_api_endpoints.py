import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert "service" in data

def test_api_overview():
    res = client.get("/api/overview")
    assert res.status_code == 200
    data = res.json()
    assert "selected_region" in data
    assert "active_scenario" in data
    assert "risk_summary_kpi" in data
    assert "wind_summary" in data

def test_api_cyclones():
    res = client.get("/api/cyclones")
    assert res.status_code == 200
    cyclones = res.json()
    assert len(cyclones) >= 2
    assert any(c["id"] == "varun_2026" for c in cyclones)

def test_api_risk_layers():
    res = client.get("/api/risk/layers?scenario_id=varun_2026")
    assert res.status_code == 200
    layers = res.json()
    assert "flood_zones" in layers
    assert "surge_zones" in layers
    assert "wind_swaths" in layers
    assert len(layers["flood_zones"]) > 0

def test_api_infrastructure():
    res = client.get("/api/infrastructure")
    assert res.status_code == 200
    assets = res.json()
    assert len(assets) > 0
    first = assets[0]
    assert "risk_score" in first
    assert "risk_level" in first

def test_api_simulation_run():
    payload = {
        "name": "Heavy Surge Test Scenario",
        "wind_speed_kmh": 165.0,
        "rainfall_24h_mm": 350.0,
        "surge_height_m": 3.8,
        "duration_hours": 36
    }
    res = client.post("/api/simulation/run", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["high_risk_assets_count"] > 0
    assert data["estimated_exposed_population"] > 0
    assert "HYPOTHETICAL SCENARIO SIMULATION" in data["disclaimer"]

def test_api_ai_copilot_fallback():
    payload = {
        "query": "Which coastal hospitals in Kakinada are at risk from storm surge?",
        "scenario_id": "varun_2026"
    }
    res = client.post("/api/ai/analyze", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data["findings"]) > 0
    assert len(data["suggested_actions"]) > 0
    assert "cited_sources" in data

def test_api_advisory_workflow():
    # 1. Create draft
    draft_payload = {
        "scenario_id": "varun_2026",
        "region_id": "andhra_pradesh",
        "audience": "fishermen",
        "language": "te"
    }
    res_draft = client.post("/api/advisories/draft", json=draft_payload)
    assert res_draft.status_code == 200
    draft = res_draft.json()
    assert draft["status"] == "draft"
    assert draft["language"] == "te"
    draft_id = draft["id"]

    # 2. Update draft
    update_payload = {
        "title": "సవరించిన మత్స్యకార అత్యవసర హెచ్చరిక",
        "content": "అన్ని బోట్లు తీరానికి చేరవలెను. తాజా హెచ్చరిక.",
        "review_notes": "Added port signal 9 emphasis"
    }
    res_update = client.put(f"/api/advisories/{draft_id}", json=update_payload)
    assert res_update.status_code == 200
    updated = res_update.json()
    assert updated["title"] == update_payload["title"]

    # 3. Approve draft
    approve_payload = {
        "reviewer_name": "Dr. V. Rao",
        "official_title": "District Disaster Management Officer, Kakinada",
        "review_notes": "Verified against latest IMD warning bulletin."
    }
    res_approve = client.post(f"/api/advisories/{draft_id}/approve", json=approve_payload)
    assert res_approve.status_code == 200
    approved = res_approve.json()
    assert approved["status"] == "approved"
    assert "Dr. V. Rao" in approved["approved_by"]
