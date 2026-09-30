"""
Wind Exposure and Field Decay Screening Module.

Concepts:
- Hazard: Cyclone eyewall maximum sustained wind speed (km/h).
- Exposure: Radial offset distance to projected cyclone track axis (km).
- Structural Vulnerability: Structural framing type (reinforced concrete, tin roof, masonry, steel, etc.).

Formulas:
- Radial Eyewall Decay:
    If distance_to_track_km <= 35.0 km (eyewall radius):
        local_wind = max_wind_kmh
    Else:
        local_wind = max_wind_kmh * (35.0 / distance_to_track_km) ^ 0.55
- Base Wind Score = min(100.0, (local_wind / 200.0) * 100.0)
- Structural Vulnerability Multiplier:
    reinforced_concrete (0.85), masonry (1.15), tin_roof (1.40),
    steel_tower (1.25), coastal_embankment (1.20), paved_asphalt (0.90)
- Wind Exposure Score = min(100.0, max(0.0, Base Wind Score * Multiplier))

Assumptions:
- 200 km/h represents extreme Super Cyclonic Storm wind speed.
- Radial wind decay follows standard empirical power law index (0.55) for tropical cyclones.

Limitations:
- Regional wind field approximation; does NOT model micro-scale turbulent gusts or CFD wind tunnel effects.
"""

from typing import Tuple, Dict, Any

STRUCTURAL_VULNERABILITY_MULTIPLIERS = {
    "reinforced_concrete": 0.85,
    "masonry": 1.15,
    "tin_roof": 1.40,
    "paved_asphalt": 0.90,
    "steel_tower": 1.25,
    "coastal_embankment": 1.20,
    "tile_roof": 1.30,
    "wooden": 1.45
}

def calculate_wind_exposure(
    max_wind_kmh: float,
    distance_to_track_km: float,
    structural_type: str = "reinforced_concrete",
    distance_is_estimated: bool = False
) -> Tuple[float, str, Dict[str, Any]]:
    """
    Calculates wind exposure score (0.0 - 100.0).

    Returns:
        Tuple containing:
        - wind_score (float 0-100)
        - explanation (str)
        - data_quality (Dict with indicators)
    """
    clean_wind = max(0.0, max_wind_kmh)
    clean_dist = max(0.0, distance_to_track_km)

    r_max = 35.0  # Radius of maximum wind (eyewall)
    if clean_dist <= r_max:
        local_wind = clean_wind
    else:
        decay = (r_max / clean_dist) ** 0.55
        local_wind = clean_wind * decay

    wind_base_score = min(100.0, (local_wind / 200.0) * 100.0)

    mod = STRUCTURAL_VULNERABILITY_MULTIPLIERS.get(structural_type.lower(), 1.0)
    wind_score = round(min(100.0, max(0.0, wind_base_score * mod)), 1)

    explanation = (
        f"Wind Exposure {wind_score}/100: "
        f"Derived local wind {local_wind:.0f} km/h (peak {clean_wind:.0f} km/h at {clean_dist:.1f}km radial offset); "
        f"Structural type '{structural_type}' vulnerability multiplier x{mod:.2f}."
    )

    quality_status = "verified" if not distance_is_estimated else "estimated"
    flags = []
    if distance_is_estimated:
        flags.append("track_distance_estimated")
    if structural_type.lower() not in STRUCTURAL_VULNERABILITY_MULTIPLIERS:
        flags.append("structural_type_default_multiplier_used")

    data_quality = {
        "status": quality_status,
        "flags": flags,
        "components": {
            "eyewall_max_wind_kmh": clean_wind,
            "estimated_local_wind_kmh": round(local_wind, 1),
            "wind_base_score_pts": round(wind_base_score, 1),
            "structural_multiplier": mod
        }
    }

    return wind_score, explanation, data_quality
