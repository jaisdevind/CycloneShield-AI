"""
Coastal Surge Susceptibility Screening Module.

Concepts:
- Hazard: Peak modeled storm surge height (meters above MSL).
- Exposure: Surface elevation (meters ASL), distance to coast / shoreline (km).
- Attenuation: Inland dissipation of wave setup and tidal surge.

Formulas:
- Effective Head = max(0.0, surge_height_m - max(0.0, elevation_m))
- Head Score = min(100.0, (effective_head / 4.0) * 100.0) if effective_head > 0 else 0.0
- Distance Attenuation = exp(-distance_to_coast_km / 4.0)
- Surge Susceptibility Score = min(100.0, head_score * 0.70 + (distance_attenuation * 100.0) * 0.30)
- Inland Limit (>20km inland): Surge Score = 0.0

Assumptions:
- 4.0m effective surge head represents extreme inundation threat for coastal Andhra Pradesh.
- Coastal surge inundation decays exponentially with distance from open sea coast.

Limitations:
- Topobathy screening index for regional planning.
- Does NOT replace 3D hydrodynamic bathymetric resonance models (SLOSH / ADCIRC).
"""

import math
from typing import Tuple, Dict, Any

def calculate_coastal_surge_susceptibility(
    surge_height_m: float,
    elevation_m: float,
    distance_to_coast_km: float,
    elevation_is_estimated: bool = False
) -> Tuple[float, str, Dict[str, Any]]:
    """
    Calculates coastal surge susceptibility screening score (0.0 - 100.0).

    Returns:
        Tuple containing:
        - surge_score (float 0-100)
        - explanation (str)
        - data_quality (Dict with indicators)
    """
    clean_dist = max(0.0, distance_to_coast_km)
    clean_surge = max(0.0, surge_height_m)
    clean_elev = max(0.0, elevation_m)

    if clean_dist > 20.0:
        data_quality = {
            "status": "verified" if not elevation_is_estimated else "estimated",
            "flags": ["inland_beyond_20km"],
            "components": {
                "effective_head_m": 0.0,
                "distance_attenuation": 0.0
            }
        }
        return 0.0, f"Asset is {clean_dist:.1f}km inland (>20km threshold); coastal surge hazard negligible.", data_quality

    effective_head = max(0.0, clean_surge - clean_elev)
    head_score = min(100.0, (effective_head / 4.0) * 100.0) if effective_head > 0 else 0.0

    distance_attenuation = math.exp(-clean_dist / 4.0)
    surge_score = round(min(100.0, head_score * 0.70 + (distance_attenuation * 100.0) * 0.30), 1)

    explanation = (
        f"Coastal Surge Susceptibility {surge_score}/100: "
        f"Modeled surge {clean_surge:.1f}m against {clean_elev:.1f}m ASL elevation produces "
        f"{effective_head:.1f}m effective head ({head_score:.1f} pts); "
        f"Shoreline offset {clean_dist:.1f}km gives inland attenuation factor {distance_attenuation:.2f}."
    )

    quality_status = "verified" if not elevation_is_estimated else "estimated"
    flags = []
    if elevation_is_estimated:
        flags.append("elevation_estimated_from_dem")

    data_quality = {
        "status": quality_status,
        "flags": flags,
        "components": {
            "surge_height_m": clean_surge,
            "effective_head_m": round(effective_head, 2),
            "head_score_pts": round(head_score, 1),
            "distance_attenuation_factor": round(distance_attenuation, 3)
        }
    }

    return surge_score, explanation, data_quality
