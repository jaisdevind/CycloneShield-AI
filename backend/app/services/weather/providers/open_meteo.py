import os
import time
import datetime
import logging
import urllib.request
import json
from typing import List, Optional, Dict, Any
from app.schemas.schemas import ScenarioResponse, TrackPoint
from app.services.weather.providers.base import BaseMeteorologicalProvider

logger = logging.getLogger(__name__)

class OpenMeteoProvider(BaseMeteorologicalProvider):
    """
    Live Meteorological Data Provider querying Open-Meteo API.
    Provides live observation & forecast data for Coastal Andhra Pradesh coordinates.
    Includes request timeouts, TTL caching, schema validation, and graceful failure handling.
    """

    def __init__(self, cache_ttl_seconds: int = 300, timeout_seconds: float = 5.0):
        self.api_url = os.getenv("OPEN_METEO_API_URL", "https://api.open-meteo.com/v1/forecast")
        self.api_key = os.getenv("WEATHER_API_KEY", "")
        self.cache_ttl_seconds = cache_ttl_seconds
        self.timeout_seconds = timeout_seconds
        self._cache: Dict[str, Any] = {}
        self._last_fetch_time: float = 0.0

    def get_provider_name(self) -> str:
        return "Open-Meteo Global Weather API (Live Observation & Forecast)"

    def is_available(self) -> bool:
        return True

    def fetch_live_data(self, lat: float = 16.8, lon: float = 82.2) -> Optional[Dict[str, Any]]:
        """Queries Open-Meteo API with timeout, API key header (if configured), and in-memory TTL cache."""
        now = time.time()
        cache_key = f"{lat}_{lon}"

        # Return cached response if within TTL
        if cache_key in self._cache and (now - self._last_fetch_time) < self.cache_ttl_seconds:
            logger.info("Returning cached Open-Meteo response.")
            return self._cache[cache_key]

        url = (
            f"{self.api_url}?latitude={lat}&longitude={lon}"
            f"&current=temperature_2m,surface_pressure,wind_speed_10m,wind_direction_10m"
            f"&hourly=precipitation,wind_speed_10m&forecast_days=2"
        )
        if self.api_key:
            url += f"&apikey={self.api_key}"

        headers = {"User-Agent": "CycloneShield-AI/1.0"}

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=self.timeout_seconds) as response:
                if response.status == 200:
                    data = json.loads(response.read().decode("utf-8"))
                    self._cache[cache_key] = data
                    self._last_fetch_time = now
                    logger.info("Successfully fetched live data from Open-Meteo API.")
                    return data
        except Exception as e:
            logger.warning(f"Open-Meteo API fetch failed or timed out: {e}")
            # Stale data fallback if cache exists
            if cache_key in self._cache:
                logger.info("Using stale cached Open-Meteo response due to fetch failure.")
                stale_data = self._cache[cache_key]
                stale_data["_is_stale"] = True
                return stale_data

        return None

    def fetch_all_scenarios(self) -> List[ScenarioResponse]:
        """Maps Open-Meteo live API response to ScenarioResponse schema, explicitly flagging missing fields."""
        raw = self.fetch_live_data(lat=16.8, lon=82.2)
        if not raw or "current" not in raw:
            return []

        current = raw.get("current", {})
        hourly = raw.get("hourly", {})
        is_stale = raw.get("_is_stale", False)

        unavailable_fields: List[str] = []

        # Wind speed
        if "wind_speed_10m" in current and current["wind_speed_10m"] is not None:
            max_wind_kmh = float(current["wind_speed_10m"])
        else:
            max_wind_kmh = None
            unavailable_fields.append("max_wind_kmh")

        # Surface pressure
        if "surface_pressure" in current and current["surface_pressure"] is not None:
            central_pressure_hpa = float(current["surface_pressure"])
        else:
            central_pressure_hpa = None
            unavailable_fields.append("central_pressure_hpa")

        # Precipitation
        precip_list = hourly.get("precipitation", None)
        if precip_list is not None and isinstance(precip_list, list) and len(precip_list) > 0:
            forecast_rainfall_24h_mm = round(sum(p for p in precip_list[:24] if p is not None), 1)
        else:
            forecast_rainfall_24h_mm = None
            unavailable_fields.append("forecast_rainfall_24h_mm")

        # Storm translation speed (not supplied by standard weather station APIs for non-tropical storm features)
        storm_speed_kmh = None
        unavailable_fields.append("storm_speed_kmh")

        now_iso = datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:00:00Z")
        quality_notes = "Live public station feed."
        if is_stale:
            quality_notes += " Warning: Data is stale due to upstream connection timeout."
        if unavailable_fields:
            quality_notes += f" Unavailable provider fields: {', '.join(unavailable_fields)}."

        live_scenario = ScenarioResponse(
            id="open_meteo_live",
            name="Coastal AP Real-Time Weather Observation (Open-Meteo)",
            category="live_observation",
            region_id="andhra_pradesh",
            description="Live observational meteorological feed for Coastal Andhra Pradesh (Kakinada / Godavari Delta).",
            is_active=True,
            max_wind_kmh=max_wind_kmh,
            wind_unit="km/h",
            central_pressure_hpa=central_pressure_hpa,
            pressure_unit="hPa",
            forecast_rainfall_24h_mm=forecast_rainfall_24h_mm,
            rainfall_unit="mm",
            storm_speed_kmh=storm_speed_kmh,
            storm_speed_unit="km/h",
            current_lat=16.8,
            current_lon=82.2,
            source_attribution="Open-Meteo Global Meteorological API (Live Public Feed)",
            data_timestamp=now_iso,
            data_quality_notes=quality_notes,
            unavailable_fields=unavailable_fields,
            track_points=[
                TrackPoint(
                    timestamp=now_iso,
                    lat=16.8,
                    lon=82.2,
                    wind_kmh=max_wind_kmh if max_wind_kmh is not None else 0.0,
                    pressure_hpa=central_pressure_hpa,
                    category="Live Station Observation",
                    status="current",
                    source="Open-Meteo API"
                )
            ],
            forecast_cone=None
        )

        return [live_scenario]

    def fetch_scenario_by_id(self, scenario_id: str) -> Optional[ScenarioResponse]:
        scenarios = self.fetch_all_scenarios()
        for sc in scenarios:
            if sc.id == scenario_id:
                return sc
        return None
