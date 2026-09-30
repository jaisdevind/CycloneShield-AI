import math
from typing import List, Dict, Any, Optional
from app.schemas.schemas import InfrastructureResponse, RiskWeightConfig
from app.services.risk.engine import RiskEngine

# Curated high-fidelity assets across Coastal Andhra Pradesh
# (Visakhapatnam, Kakinada, Machilipatnam, Bapatla, Ongole, Nellore)
COASTAL_AP_ASSETS = [
    {
        "id": "hosp_kg_visakhapatnam",
        "name": "King George Hospital (Apex Trauma Center)",
        "category": "hospital",
        "region_id": "andhra_pradesh",
        "lat": 17.7088,
        "lon": 83.3032,
        "district": "Visakhapatnam",
        "elevation_m": 16.5,
        "distance_to_coast_km": 0.8,
        "capacity": 1250,
        "structural_type": "reinforced_concrete",
        "data_source": "AP State Health Systems Project / OSM ID 451829102",
        "data_quality_status": "verified"
    },
    {
        "id": "hosp_gg_kakinada",
        "name": "Government General Hospital, Kakinada",
        "category": "hospital",
        "region_id": "andhra_pradesh",
        "lat": 16.9625,
        "lon": 82.2384,
        "district": "Kakinada",
        "elevation_m": 3.8,
        "distance_to_coast_km": 2.1,
        "capacity": 850,
        "structural_type": "reinforced_concrete",
        "data_source": "APSDMA Critical Health Directory / OSM ID 8291048",
        "data_quality_status": "verified"
    },
    {
        "id": "hosp_district_machilipatnam",
        "name": "District Hospital Machilipatnam",
        "category": "hospital",
        "region_id": "andhra_pradesh",
        "lat": 16.1824,
        "lon": 81.1352,
        "district": "Krishna",
        "elevation_m": 2.4,
        "distance_to_coast_km": 3.4,
        "capacity": 350,
        "structural_type": "masonry",
        "data_source": "Krishna District Disaster Management Plan",
        "data_quality_status": "verified"
    },
    {
        "id": "shelter_kakinada_port_cyclone",
        "name": "APSDMA Multipurpose Cyclone Shelter (Kakinada Port)",
        "category": "shelter",
        "region_id": "andhra_pradesh",
        "lat": 16.9850,
        "lon": 82.2650,
        "district": "Kakinada",
        "elevation_m": 5.2,
        "distance_to_coast_km": 0.6,
        "capacity": 1500,
        "structural_type": "reinforced_concrete",
        "data_source": "APSDMA World Bank NCRMP Phase-II Database",
        "data_quality_status": "verified"
    },
    {
        "id": "shelter_coringa_mangrove_relief",
        "name": "Coringa Coastal Community Relief Center",
        "category": "shelter",
        "region_id": "andhra_pradesh",
        "lat": 16.8210,
        "lon": 82.3020,
        "district": "Kakinada",
        "elevation_m": 2.1,
        "distance_to_coast_km": 1.1,
        "capacity": 900,
        "structural_type": "reinforced_concrete",
        "data_source": "APSDMA NCRMP Database / Community Registry",
        "data_quality_status": "verified"
    },
    {
        "id": "shelter_bapatla_suryalanka_center",
        "name": "Bapatla-Suryalanka Cyclone Evacuation Shelter",
        "category": "shelter",
        "region_id": "andhra_pradesh",
        "lat": 15.8640,
        "lon": 80.4720,
        "district": "Bapatla",
        "elevation_m": 4.5,
        "distance_to_coast_km": 1.8,
        "capacity": 1200,
        "structural_type": "reinforced_concrete",
        "data_source": "Bapatla Taluk Disaster Relief Center",
        "data_quality_status": "verified"
    },
    {
        "id": "power_kakinada_220kv_substation",
        "name": "APTRANSCO 220kV Substation (Kakinada Industrial Grid)",
        "category": "power_substation",
        "region_id": "andhra_pradesh",
        "lat": 17.0120,
        "lon": 82.2150,
        "district": "Kakinada",
        "elevation_m": 4.2,
        "distance_to_coast_km": 4.5,
        "capacity": None,
        "structural_type": "steel_tower",
        "data_source": "APTRANSCO State Grid Map / OSM ID 910283",
        "data_quality_status": "verified"
    },
    {
        "id": "port_visakhapatnam_container_terminal",
        "name": "Visakhapatnam Port Container Terminal",
        "category": "port",
        "region_id": "andhra_pradesh",
        "lat": 17.6920,
        "lon": 83.2980,
        "district": "Visakhapatnam",
        "elevation_m": 3.0,
        "distance_to_coast_km": 0.1,
        "capacity": None,
        "structural_type": "reinforced_concrete",
        "data_source": "Visakhapatnam Port Authority / National Ports Database",
        "data_quality_status": "verified"
    },
    {
        "id": "bridge_godavari_fourth_bridge",
        "name": "Godavari River 4th Bridge (Rajahmundry Bypass)",
        "category": "bridge",
        "region_id": "andhra_pradesh",
        "lat": 17.0150,
        "lon": 81.7650,
        "district": "East Godavari",
        "elevation_m": 12.0,
        "distance_to_coast_km": 42.0,
        "capacity": None,
        "structural_type": "reinforced_concrete",
        "data_source": "National Highways Authority of India (NHAI)",
        "data_quality_status": "verified"
    },
    {
        "id": "road_nh16_kakinada_corridor",
        "name": "NH-16 Coastal Expressway Segment (Km 840-865)",
        "category": "road",
        "region_id": "andhra_pradesh",
        "lat": 17.0500,
        "lon": 82.1800,
        "district": "Kakinada",
        "elevation_m": 6.5,
        "distance_to_coast_km": 8.0,
        "capacity": None,
        "structural_type": "paved_asphalt",
        "data_source": "NHAI Road Information System / OpenStreetMap",
        "data_quality_status": "verified"
    },
    {
        "id": "hosp_rims_ongole",
        "name": "Government General Hospital (RIMS) Ongole",
        "category": "hospital",
        "region_id": "andhra_pradesh",
        "lat": 15.5030,
        "lon": 80.0450,
        "district": "Prakasam",
        "elevation_m": 14.0,
        "distance_to_coast_km": 14.5,
        "capacity": 700,
        "structural_type": "reinforced_concrete",
        "data_source": "AP State Health Systems",
        "data_quality_status": "verified"
    },
    {
        "id": "shelter_machilipatnam_gilakaladindi",
        "name": "Gilakaladindi Coastal Fishermen Relief Shelter",
        "category": "shelter",
        "region_id": "andhra_pradesh",
        "lat": 16.1510,
        "lon": 81.1620,
        "district": "Krishna",
        "elevation_m": 1.8,
        "distance_to_coast_km": 0.4,
        "capacity": 800,
        "structural_type": "reinforced_concrete",
        "data_source": "APSDMA NCRMP Database",
        "data_quality_status": "verified"
    }
]

def calculate_haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Haversine formula to calculate geodesic distance in km."""
    r = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    
    a = (math.sin(delta_phi / 2.0) ** 2 +
         math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return r * c

class InfrastructureService:
    def __init__(self):
        self.assets = COASTAL_AP_ASSETS

    def get_all_assets(
        self,
        scenario_lat: float = 16.5,
        scenario_lon: float = 82.5,
        max_wind_kmh: float = 155.0,
        rainfall_24h_mm: float = 285.0,
        surge_height_m: float = 2.8,
        weights: Optional[RiskWeightConfig] = None
    ) -> List[InfrastructureResponse]:
        """
        Assesses all infrastructure assets against scenario meteorological conditions
        using the unified deterministic RiskEngine.
        """
        evaluated_assets = []
        for raw in self.assets:
            # 1. Calculate radial distance to storm center
            dist_to_cyclone_km = calculate_haversine_km(
                raw["lat"], raw["lon"], scenario_lat, scenario_lon
            )

            # 2. Risk Engine analysis
            analysis = RiskEngine.analyze_asset_risk(
                asset_category=raw["category"],
                elevation_m=raw["elevation_m"],
                distance_to_coast_km=raw["distance_to_coast_km"],
                distance_to_track_km=dist_to_cyclone_km,
                rainfall_24h_mm=rainfall_24h_mm,
                surge_height_m=surge_height_m,
                max_wind_kmh=max_wind_kmh,
                structural_type=raw.get("structural_type"),
                capacity=raw.get("capacity"),
                distance_to_waterway_km=1.2,
                land_cover_type="urban" if raw["category"] in ("hospital", "power_substation", "port") else "residential",
                weights=weights
            )

            evaluated_assets.append(InfrastructureResponse(
                id=raw["id"],
                name=raw["name"],
                category=raw["category"],
                region_id=raw["region_id"],
                lat=raw["lat"],
                lon=raw["lon"],
                district=raw["district"],
                elevation_m=raw["elevation_m"],
                distance_to_coast_km=raw["distance_to_coast_km"],
                capacity=raw.get("capacity"),
                structural_type=raw.get("structural_type"),
                data_source=raw["data_source"],
                data_quality_status=analysis.get("data_quality_status", raw["data_quality_status"]),
                risk_score=analysis["risk_score"],
                risk_level=analysis["risk_level"],
                flood_score=analysis["flood_score"],
                surge_score=analysis["surge_score"],
                wind_score=analysis["wind_score"],
                vulnerability_score=analysis["vulnerability_score"],
                explanation=analysis["explanation"],
                component_explanations=analysis.get("component_explanations"),
                data_quality_flags=analysis.get("data_quality_flags", [])
            ))

        return evaluated_assets

    def get_asset_by_id(self, asset_id: str, scenario_lat: float = 16.5, scenario_lon: float = 82.5) -> Optional[InfrastructureResponse]:
        assets = self.get_all_assets(scenario_lat=scenario_lat, scenario_lon=scenario_lon)
        for a in assets:
            if a.id == asset_id:
                return a
        return None

infrastructure_service = InfrastructureService()
