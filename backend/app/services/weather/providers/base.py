from abc import ABC, abstractmethod
from typing import List, Optional
from app.schemas.schemas import ScenarioResponse

class BaseMeteorologicalProvider(ABC):
    """
    Abstract interface for meteorological data providers.
    Enables pluggable weather backends (Open-Meteo, NOAA, IMD Archive, Synthetic Demo).
    """

    @abstractmethod
    def get_provider_name(self) -> str:
        """Returns the human-readable identifier for the provider."""
        pass

    @abstractmethod
    def is_available(self) -> bool:
        """Returns True if the provider credentials/connectivity are active."""
        pass

    @abstractmethod
    def fetch_all_scenarios(self) -> List[ScenarioResponse]:
        """Fetches active, historical, or hypothetical cyclone scenarios."""
        pass

    @abstractmethod
    def fetch_scenario_by_id(self, scenario_id: str) -> Optional[ScenarioResponse]:
        """Fetches a specific scenario by ID."""
        pass
