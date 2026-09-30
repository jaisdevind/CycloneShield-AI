import logging
from typing import List, Optional
from app.core.config import settings
from app.schemas.schemas import ScenarioResponse
from app.services.weather.providers.base import BaseMeteorologicalProvider
from app.services.weather.providers.demo_synthetic import DemoSyntheticProvider, DEMO_SCENARIO_VARUN, HISTORICAL_SCENARIO_MICHAUNG
from app.services.weather.providers.open_meteo import OpenMeteoProvider

logger = logging.getLogger(__name__)

class WeatherService:
    """
    Manager service for CycloneShield AI meteorological operations.
    Supports pluggable providers (Open-Meteo, Synthetic Demo, Historical Archives)
    with automatic fallback to synthetic demo data when live feeds fail or are unconfigured.
    """

    def __init__(self):
        self.mode = settings.WEATHER_PROVIDER_MODE
        self.demo_provider = DemoSyntheticProvider()
        self.live_provider = OpenMeteoProvider()

    def get_provider(self) -> BaseMeteorologicalProvider:
        return self.demo_provider

    def get_all_scenarios(self) -> List[ScenarioResponse]:
        """
        Returns all available cyclone scenarios across live, synthetic demo, and historical archives.
        Always includes the clearly labeled demo & historical scenarios to ensure continuity.
        """
        scenarios: List[ScenarioResponse] = []

        # Attempt live provider fetch if configured for live/open_meteo
        if self.mode in ("live", "open_meteo"):
            try:
                live_scenarios = self.live_provider.fetch_all_scenarios()
                if live_scenarios:
                    scenarios.extend(live_scenarios)
            except Exception as e:
                logger.warning(f"Live weather provider error: {e}. Falling back to demo provider.")

        # Always include demo synthetic and historical scenarios
        demo_scenarios = self.demo_provider.fetch_all_scenarios()
        for ds in demo_scenarios:
            if not any(s.id == ds.id for s in scenarios):
                scenarios.append(ds)

        return scenarios

    def get_scenario_by_id(self, scenario_id: str) -> Optional[ScenarioResponse]:
        scenarios = self.get_all_scenarios()
        for sc in scenarios:
            if sc.id == scenario_id:
                return sc
        # Default fallback to synthetic demo scenario Varun 2026
        return DEMO_SCENARIO_VARUN

    def get_active_scenario(self) -> ScenarioResponse:
        scenarios = self.get_all_scenarios()
        # Find active scenario (or default to Varun 2026)
        active = next((sc for sc in scenarios if sc.is_active), DEMO_SCENARIO_VARUN)
        return active

weather_service = WeatherService()
