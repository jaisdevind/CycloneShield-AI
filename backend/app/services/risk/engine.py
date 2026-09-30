"""
CycloneShield AI Central Risk Engine Orchestrator.

Delegates calculation to independent, tested risk modules:
- Rainfall / Flood Susceptibility (rainfall_flood.py)
- Coastal Surge Susceptibility (coastal_surge.py)
- Wind Exposure Decay (wind_exposure.py)
- Infrastructure Structural Vulnerability (infrastructure_vulnerability.py)
- Composite Risk Aggregation (composite_risk.py)
- Road-Segment Hazard Exposure (road_exposure.py)
"""

from typing import Tuple, Dict, Any, Optional, List
from app.schemas.schemas import RiskWeightConfig
from app.services.risk.rainfall_flood import calculate_flood_susceptibility
from app.services.risk.coastal_surge import calculate_coastal_surge_susceptibility
from app.services.risk.wind_exposure import calculate_wind_exposure
from app.services.risk.infrastructure_vulnerability import calculate_asset_vulnerability
from app.services.risk.composite_risk import calculate_composite_risk
from app.services.risk.road_exposure import evaluate_road_hazard_intersection

class RiskEngine:
    """
    Transparent, deterministic hazard and vulnerability orchestrator.
    Computes individual susceptibility screening scores, composite risk, and component explanations.
    """

    @staticmethod
    def calculate_flood_susceptibility(
        rainfall_24h_mm: float,
        elevation_m: float,
        distance_to_waterway_km: float = 1.5,
        land_cover_type: str = "urban"
    ) -> Tuple[float, str]:
        score, explanation, _ = calculate_flood_susceptibility(
            rainfall_24h_mm=rainfall_24h_mm,
            elevation_m=elevation_m,
            distance_to_waterway_km=distance_to_waterway_km,
            land_cover_type=land_cover_type
        )
        return score, explanation

    @staticmethod
    def calculate_coastal_surge_susceptibility(
        surge_height_m: float,
        elevation_m: float,
        distance_to_coast_km: float
    ) -> Tuple[float, str]:
        score, explanation, _ = calculate_coastal_surge_susceptibility(
            surge_height_m=surge_height_m,
            elevation_m=elevation_m,
            distance_to_coast_km=distance_to_coast_km
        )
        return score, explanation

    @staticmethod
    def calculate_wind_exposure(
        max_wind_kmh: float,
        distance_to_track_km: float,
        structural_type: str = "reinforced_concrete"
    ) -> Tuple[float, str]:
        score, explanation, _ = calculate_wind_exposure(
            max_wind_kmh=max_wind_kmh,
            distance_to_track_km=distance_to_track_km,
            structural_type=structural_type
        )
        return score, explanation

    @classmethod
    def calculate_composite_risk(
        cls,
        flood_score: float,
        surge_score: float,
        wind_score: float,
        weights: Optional[RiskWeightConfig] = None
    ) -> Tuple[float, str, str]:
        composite, level, summary, _ = calculate_composite_risk(
            flood_score=flood_score,
            surge_score=surge_score,
            wind_score=wind_score,
            weights=weights
        )
        return composite, level, summary

    @classmethod
    def analyze_asset_risk(
        cls,
        asset_category: str,
        elevation_m: float,
        distance_to_coast_km: float,
        distance_to_track_km: float,
        rainfall_24h_mm: float,
        surge_height_m: float,
        max_wind_kmh: float,
        structural_type: Optional[str] = None,
        capacity: Optional[int] = None,
        distance_to_waterway_km: float = 1.5,
        land_cover_type: str = "urban",
        weights: Optional[RiskWeightConfig] = None,
        road_geometry: Optional[Dict[str, Any]] = None,
        hazard_polygons: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """
        Full risk evaluation orchestrator for an infrastructure asset.
        Returns component scores, risk tier, audit explanations, and data quality indicators.
        """
        # 1. Component Hazard Calculations
        flood_score, flood_exp, flood_dq = calculate_flood_susceptibility(
            rainfall_24h_mm=rainfall_24h_mm,
            elevation_m=elevation_m,
            distance_to_waterway_km=distance_to_waterway_km,
            land_cover_type=land_cover_type
        )

        surge_score, surge_exp, surge_dq = calculate_coastal_surge_susceptibility(
            surge_height_m=surge_height_m,
            elevation_m=elevation_m,
            distance_to_coast_km=distance_to_coast_km
        )

        wind_score, wind_exp, wind_dq = calculate_wind_exposure(
            max_wind_kmh=max_wind_kmh,
            distance_to_track_km=distance_to_track_km,
            structural_type=structural_type or "reinforced_concrete"
        )

        vuln_score, vuln_exp, vuln_dq = calculate_asset_vulnerability(
            asset_category=asset_category,
            structural_type=structural_type,
            capacity=capacity
        )

        # 2. Road Hazard Intersection evaluation (if road geometry provided)
        road_metadata = None
        if asset_category.lower() in ("road", "bridge") and road_geometry:
            is_intersecting, road_score, road_exp, road_metadata = evaluate_road_hazard_intersection(
                road_geojson_geometry=road_geometry,
                hazard_polygons=hazard_polygons or [],
                rainfall_24h_mm=rainfall_24h_mm,
                surge_height_m=surge_height_m
            )
            # Use max of flood and spatial road score for road flood component
            flood_score = max(flood_score, road_score)

        # 3. Composite Risk Calculation
        composite_score, risk_level, composite_exp, composite_meta = calculate_composite_risk(
            flood_score=flood_score,
            surge_score=surge_score,
            wind_score=wind_score,
            weights=weights
        )

        # Combine explanations
        full_explanation = (
            f"{composite_exp} | {flood_exp} | {surge_exp} | {wind_exp} | {vuln_exp}"
        )

        # Aggregate data quality indicators
        all_flags = list(set(
            flood_dq.get("flags", []) +
            surge_dq.get("flags", []) +
            wind_dq.get("flags", []) +
            vuln_dq.get("flags", [])
        ))
        data_quality_status = "verified" if not all_flags else "estimated"

        return {
            "risk_score": composite_score,
            "risk_level": risk_level,
            "flood_score": flood_score,
            "surge_score": surge_score,
            "wind_score": wind_score,
            "vulnerability_score": vuln_score,
            "explanation": full_explanation,
            "component_explanations": {
                "composite": composite_exp,
                "flood": flood_exp,
                "surge": surge_exp,
                "wind": wind_exp,
                "vulnerability": vuln_exp
            },
            "data_quality_status": data_quality_status,
            "data_quality_flags": all_flags,
            "weights": composite_meta.get("weights"),
            "road_intersection_details": road_metadata
        }
