"""
Rainfall and Flood Susceptibility Screening Module.

Concepts:
- Hazard: 24-hour rainfall accumulation (mm).
- Exposure: Elevation (meters ASL), proximity to rivers/drainage canals (km).
- Land Cover Runoff Modifier: Impervious surface coefficient (urban, agricultural, forest, etc.).

Formulas:
- Rainfall Hazard Score: min(100.0, (rainfall_24h_mm / 350.0) * 100.0)
- Elevation Exposure Score: 100 - (elevation_m * 4) for elevation < 25m, else 100 - (elevation_m * 2)
- Drainage Proximity Score: max(0.0, 100.0 - (distance_to_waterway_km * 25.0))
- Land Cover Multiplier: urban (1.15), commercial (1.20), industrial (1.10), residential (1.05), cropland (0.85), forest (0.65), water (1.30)
- Raw Score = (0.45 * rain_score + 0.35 * elev_score + 0.20 * drain_score) * land_cover_multiplier
- Flood Susceptibility Score = min(100.0, max(0.0, Raw Score))

Assumptions:
- 350mm / 24h represents extreme monsoon / cyclonic rainfall threshold in Coastal AP.
- Low-lying areas (<10m ASL) suffer from runoff accumulation and drainage congestion.

Limitations:
- This is a heuristic screening score for regional prioritization.
- It does NOT simulate full 2D hydrodynamic flow, culvert capacities, or urban storm drain networks.
"""

from typing import Tuple, Dict, Any, Optional

def calculate_flood_susceptibility(
    rainfall_24h_mm: float,
    elevation_m: float,
    distance_to_waterway_km: float = 1.5,
    land_cover_type: str = "urban",
    elevation_is_estimated: bool = False,
    distance_is_estimated: bool = False
) -> Tuple[float, str, Dict[str, Any]]:
    """
    Computes rainfall/flood susceptibility screening score (0.0 - 100.0).

    Returns:
        Tuple containing:
        - flood_score (float 0-100)
        - explanation (str)
        - data_quality (Dict with indicators)
    """
    # 1. Rainfall Hazard (0 - 100)
    rain_score = min(100.0, (max(0.0, rainfall_24h_mm) / 350.0) * 100.0)

    # 2. Elevation Exposure
    if elevation_m <= 0:
        elev_score = 100.0
    elif elevation_m < 25.0:
        elev_score = max(0.0, 100.0 - (elevation_m * 4.0))
    else:
        elev_score = max(0.0, 100.0 - (elevation_m * 2.0))

    # 3. Drainage Proximity Exposure
    drain_score = max(0.0, 100.0 - (max(0.0, distance_to_waterway_km) * 25.0))

    # 4. Land Cover Multiplier
    impervious_weights = {
        "urban": 1.15,
        "commercial": 1.20,
        "industrial": 1.10,
        "residential": 1.05,
        "cropland": 0.85,
        "forest": 0.65,
        "water": 1.30
    }
    lc_mod = impervious_weights.get(land_cover_type.lower(), 1.0)

    # Combined score
    raw_flood = (0.45 * rain_score + 0.35 * elev_score + 0.20 * drain_score) * lc_mod
    flood_score = round(min(100.0, max(0.0, raw_flood)), 1)

    explanation = (
        f"Flood Susceptibility {flood_score}/100: "
        f"24h Rainfall ({rainfall_24h_mm:.0f}mm) contributes {rain_score:.1f} pts; "
        f"Elevation ({elevation_m:.1f}m ASL) contributes {elev_score:.1f} pts; "
        f"Drainage Proximity ({distance_to_waterway_km:.1f}km) contributes {drain_score:.1f} pts; "
        f"Land cover ({land_cover_type}) runoff multiplier x{lc_mod:.2f}."
    )

    quality_status = "verified"
    flags = []
    if elevation_is_estimated:
        quality_status = "estimated"
        flags.append("elevation_estimated_from_dem")
    if distance_is_estimated:
        quality_status = "estimated"
        flags.append("waterway_distance_default")

    data_quality = {
        "status": quality_status,
        "flags": flags,
        "components": {
            "rainfall_hazard_pts": round(rain_score, 1),
            "elevation_exposure_pts": round(elev_score, 1),
            "drainage_proximity_pts": round(drain_score, 1),
            "land_cover_multiplier": lc_mod
        }
    }

    return flood_score, explanation, data_quality
