import json
import pytest
from unittest.mock import patch, MagicMock
from app.services.weather.providers.open_meteo import OpenMeteoProvider
from app.services.weather.providers.demo_synthetic import DemoSyntheticProvider
from app.services.weather.service import WeatherService
from app.schemas.schemas import ScenarioResponse

@pytest.fixture
def mock_open_meteo_response():
    return {
        "latitude": 16.8,
        "longitude": 82.2,
        "current": {
            "time": "2026-09-30T10:00:00Z",
            "temperature_2m": 28.5,
            "surface_pressure": 995.2,
            "wind_speed_10m": 42.0,
            "wind_direction_10m": 120
        },
        "hourly": {
            "time": ["2026-09-30T10:00:00Z"],
            "precipitation": [12.5, 15.0, 18.2, 5.0] + [0.0] * 20,
            "wind_speed_10m": [42.0] * 24
        }
    }

def test_open_meteo_provider_successful_parsing(mock_open_meteo_response):
    provider = OpenMeteoProvider(cache_ttl_seconds=300)
    
    with patch("urllib.request.urlopen") as mock_urlopen:
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.read.return_value = json.dumps(mock_open_meteo_response).encode("utf-8")
        mock_urlopen.return_value.__enter__.return_value = mock_response

        scenarios = provider.fetch_all_scenarios()
        assert len(scenarios) == 1
        sc = scenarios[0]
        assert sc.id == "open_meteo_live"
        assert sc.max_wind_kmh == 42.0
        assert sc.wind_unit == "km/h"
        assert sc.central_pressure_hpa == 995.2
        assert sc.pressure_unit == "hPa"
        assert sc.forecast_rainfall_24h_mm == 50.7
        assert sc.rainfall_unit == "mm"
        assert sc.category == "live_observation"
        assert "Open-Meteo" in sc.source_attribution
        assert "storm_speed_kmh" in sc.unavailable_fields

def test_open_meteo_provider_missing_fields():
    """Verify that missing API fields are flagged as unavailable without inventing dummy data."""
    incomplete_response = {
        "current": {
            "time": "2026-09-30T10:00:00Z",
            "wind_speed_10m": 35.0
            # surface_pressure is missing!
        },
        "hourly": {}
    }
    provider = OpenMeteoProvider(cache_ttl_seconds=0)

    with patch("urllib.request.urlopen") as mock_urlopen:
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.read.return_value = json.dumps(incomplete_response).encode("utf-8")
        mock_urlopen.return_value.__enter__.return_value = mock_response

        scenarios = provider.fetch_all_scenarios()
        assert len(scenarios) == 1
        sc = scenarios[0]
        assert sc.max_wind_kmh == 35.0
        assert sc.central_pressure_hpa is None
        assert "central_pressure_hpa" in sc.unavailable_fields
        assert sc.forecast_rainfall_24h_mm is None
        assert "forecast_rainfall_24h_mm" in sc.unavailable_fields

def test_open_meteo_provider_caching(mock_open_meteo_response):
    """Verify in-memory TTL caching prevents redundant API calls."""
    provider = OpenMeteoProvider(cache_ttl_seconds=300)

    with patch("urllib.request.urlopen") as mock_urlopen:
        mock_response = MagicMock()
        mock_response.status = 200
        mock_response.read.return_value = json.dumps(mock_open_meteo_response).encode("utf-8")
        mock_urlopen.return_value.__enter__.return_value = mock_response

        # Call twice
        res1 = provider.fetch_live_data()
        res2 = provider.fetch_live_data()

        assert res1 == res2
        assert mock_urlopen.call_count == 1  # Only queried once!

def test_open_meteo_provider_api_failure():
    """Verify graceful handling when API fails or times out."""
    provider = OpenMeteoProvider(cache_ttl_seconds=0, timeout_seconds=1.0)

    with patch("urllib.request.urlopen", side_effect=Exception("Connection timed out")):
        scenarios = provider.fetch_all_scenarios()
        assert scenarios == []  # Gracefully returns empty list without crashing

def test_demo_synthetic_provider():
    """Verify synthetic demonstration provider returns clearly labeled fallback scenarios."""
    provider = DemoSyntheticProvider()
    scenarios = provider.fetch_all_scenarios()
    assert len(scenarios) >= 2

    varun = next(s for s in scenarios if s.id == "varun_2026")
    assert varun.category == "synthetic_demo"
    assert "Simulated" in varun.source_attribution

    michaung = next(s for s in scenarios if s.id == "michaung_2023")
    assert michaung.category == "historical_baseline"

def test_weather_service_fallback():
    """Verify WeatherService automatically falls back to demo data when live provider fails."""
    service = WeatherService()
    service.mode = "live"
    
    with patch.object(service.live_provider, "fetch_all_scenarios", side_effect=Exception("API offline")):
        scenarios = service.get_all_scenarios()
        assert len(scenarios) >= 2
        assert any(s.id == "varun_2026" for s in scenarios)
