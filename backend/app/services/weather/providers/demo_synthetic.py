import datetime
from typing import List, Optional
from app.schemas.schemas import ScenarioResponse, TrackPoint, ForecastCone
from app.services.weather.providers.base import BaseMeteorologicalProvider

def get_now_utc_str() -> str:
    return datetime.datetime.now(datetime.UTC).strftime("%Y-%m-%dT%H:00:00Z")

DEMO_SCENARIO_VARUN = ScenarioResponse(
    id="varun_2026",
    name="Severe Cyclonic Storm 'Varun' (SYNTHETIC DEMONSTRATION SCENARIO)",
    category="synthetic_demo",
    region_id="andhra_pradesh",
    description="SYNTHETIC DEMONSTRATION SCENARIO simulating an approaching severe cyclonic storm in the Bay of Bengal for operational screening.",
    is_active=True,
    max_wind_kmh=155.0,
    central_pressure_hpa=974.0,
    forecast_rainfall_24h_mm=285.0,
    storm_speed_kmh=16.5,
    current_lat=15.85,
    current_lon=83.40,
    source_attribution="Simulated IMD/RSMC Format Demonstration Dataset (Non-operational)",
    data_timestamp=get_now_utc_str(),
    track_points=[
        TrackPoint(timestamp="2026-09-28T06:00:00Z", lat=14.2, lon=84.8, wind_kmh=85.0, pressure_hpa=994.0, category="Cyclonic Storm", status="past_observed"),
        TrackPoint(timestamp="2026-09-28T12:00:00Z", lat=14.7, lon=84.3, wind_kmh=110.0, pressure_hpa=988.0, category="Severe Cyclonic Storm", status="past_observed"),
        TrackPoint(timestamp="2026-09-28T18:00:00Z", lat=15.3, lon=83.8, wind_kmh=135.0, pressure_hpa=980.0, category="Severe Cyclonic Storm", status="past_observed"),
        TrackPoint(timestamp="2026-09-29T00:00:00Z", lat=15.85, lon=83.40, wind_kmh=155.0, pressure_hpa=974.0, category="Very Severe Cyclonic Storm", status="current"),
        TrackPoint(timestamp="2026-09-29T06:00:00Z", lat=16.4, lon=82.9, wind_kmh=145.0, pressure_hpa=978.0, category="Very Severe Cyclonic Storm", status="forecast"),
        TrackPoint(timestamp="2026-09-29T12:00:00Z", lat=16.95, lon=82.35, wind_kmh=130.0, pressure_hpa=984.0, category="Landfall Projected (Near Kakinada)", status="forecast"),
        TrackPoint(timestamp="2026-09-29T18:00:00Z", lat=17.4, lon=81.9, wind_kmh=90.0, pressure_hpa=992.0, category="Inland Weakening", status="forecast"),
        TrackPoint(timestamp="2026-09-30T00:00:00Z", lat=17.9, lon=81.6, wind_kmh=55.0, pressure_hpa=1000.0, category="Depression", status="forecast")
    ],
    forecast_cone=ForecastCone(
        center_track=[
            [15.85, 83.40],
            [16.4, 82.9],
            [16.95, 82.35],
            [17.4, 81.9],
            [17.9, 81.6]
        ],
        cone_polygon=[
            [15.85, 83.15],
            [16.35, 82.55],
            [16.85, 81.90],
            [17.35, 81.35],
            [17.95, 81.10],
            [18.00, 82.10],
            [17.45, 82.45],
            [17.05, 82.80],
            [16.45, 83.25],
            [15.85, 83.65],
            [15.85, 83.15]
        ],
        uncertainty_radius_km=[25.0, 45.0, 70.0, 105.0, 140.0]
    )
)

HISTORICAL_SCENARIO_MICHAUNG = ScenarioResponse(
    id="michaung_2023",
    name="Cyclone 'Michaung' (HISTORICAL BASELINE)",
    category="historical_baseline",
    region_id="andhra_pradesh",
    description="HISTORICAL BASELINE post-event analysis of Severe Cyclonic Storm Michaung (Dec 2023) near Bapatla.",
    is_active=False,
    max_wind_kmh=110.0,
    central_pressure_hpa=988.0,
    forecast_rainfall_24h_mm=310.0,
    storm_speed_kmh=12.0,
    current_lat=15.9,
    current_lon=80.45,
    source_attribution="IMD Post-Storm Reanalysis Archive / Copernicus EMS Rapid Mapping",
    data_timestamp="2023-12-05T12:00:00Z",
    track_points=[
        TrackPoint(timestamp="2023-12-04T06:00:00Z", lat=14.1, lon=80.3, wind_kmh=95.0, pressure_hpa=992.0, category="Cyclonic Storm", status="past_observed"),
        TrackPoint(timestamp="2023-12-04T18:00:00Z", lat=14.9, lon=80.2, wind_kmh=105.0, pressure_hpa=990.0, category="Severe Cyclonic Storm", status="past_observed"),
        TrackPoint(timestamp="2023-12-05T06:00:00Z", lat=15.5, lon=80.3, wind_kmh=110.0, pressure_hpa=988.0, category="Landfall Approach", status="past_observed"),
        TrackPoint(timestamp="2023-12-05T12:00:00Z", lat=15.9, lon=80.45, wind_kmh=100.0, pressure_hpa=990.0, category="Landfall at Bapatla", status="current")
    ],
    forecast_cone=None
)

class DemoSyntheticProvider(BaseMeteorologicalProvider):
    """Fallback provider yielding clearly labeled synthetic and historical demonstration scenarios."""

    def get_provider_name(self) -> str:
        return "Demo Synthetic & Historical Archive Provider"

    def is_available(self) -> bool:
        return True

    def fetch_all_scenarios(self) -> List[ScenarioResponse]:
        return [DEMO_SCENARIO_VARUN, HISTORICAL_SCENARIO_MICHAUNG]

    def fetch_scenario_by_id(self, scenario_id: str) -> Optional[ScenarioResponse]:
        for sc in self.fetch_all_scenarios():
            if sc.id == scenario_id:
                return sc
        return DEMO_SCENARIO_VARUN
