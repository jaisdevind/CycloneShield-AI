"""
Road-Segment Hazard Exposure & Intersection Screening Module.

Concepts:
- Identifies spatial intersections between road geometry (LineString/MultiLineString) and modeled flood/surge hazard extent polygons.
- Evaluates inundation and wind hazard along transport corridors.

Formulas & Spatial Operations:
- Spatial Intersection: checks if road_geometry intersects hazard_polygon (using Shapely).
- Intersecting Length Ratio: computes length of road segment within hazard polygon relative to total length.
- Hazard Score = min(100.0, Exposure Ratio * Max Hazard Layer Score)

Assumptions:
- Road segments intersecting modeled 24h flood or surge polygons experience elevated passability hazard.

Mandatory Operational Disclaimer:
- Modeled hazard exposure ONLY; do NOT claim an actual road closure without verified field status or transit authority feeds.
"""

from typing import Tuple, Dict, Any, List, Optional
from shapely.geometry import shape, LineString, Polygon, MultiPolygon

ROAD_ACCESSIBILITY_DISCLAIMER = (
    "Modeled hazard exposure screening only; check official AP State Road Transport Corporation "
    "and District Police advisories for verified real-world road closures."
)

def evaluate_road_hazard_intersection(
    road_geojson_geometry: Dict[str, Any],
    hazard_polygons: List[Dict[str, Any]],
    rainfall_24h_mm: float = 0.0,
    surge_height_m: float = 0.0
) -> Tuple[bool, float, str, Dict[str, Any]]:
    """
    Evaluates spatial intersection between a road segment geometry and hazard polygons.

    Args:
        road_geojson_geometry: GeoJSON geometry dict (LineString or Point)
        hazard_polygons: List of GeoJSON Polygon/MultiPolygon dicts representing flood/surge hazard zones
        rainfall_24h_mm: Rainfall intensity
        surge_height_m: Surge height

    Returns:
        Tuple containing:
        - is_intersecting (bool)
        - hazard_score (float 0-100)
        - explanation (str)
        - metadata (Dict)
    """
    try:
        road_geom = shape(road_geojson_geometry)
    except Exception as e:
        return False, 0.0, f"Invalid road geometry format: {e}", {
            "status": "error",
            "disclaimer": ROAD_ACCESSIBILITY_DISCLAIMER
        }

    is_intersecting = False
    max_hazard_score = 0.0
    intersected_layers = []

    road_length = road_geom.length if hasattr(road_geom, "length") and road_geom.length > 0 else 0.001
    intersected_length = 0.0

    for hazard in hazard_polygons:
        try:
            poly_geom = shape(hazard.get("geometry", hazard))
            if road_geom.intersects(poly_geom):
                is_intersecting = True
                intersection_geom = road_geom.intersection(poly_geom)
                intersected_length += intersection_geom.length

                layer_name = hazard.get("properties", {}).get("layer_type", "hazard_zone")
                layer_score = float(hazard.get("properties", {}).get("severity_score", 60.0))
                max_hazard_score = max(max_hazard_score, layer_score)
                intersected_layers.append(layer_name)
        except Exception:
            continue

    if not is_intersecting and (rainfall_24h_mm > 200.0 or surge_height_m > 1.5):
        # Even if polygon geometries are coarse, estimate high rainfall/surge exposure
        exposure_ratio = 0.3
        hazard_score = min(100.0, round(exposure_ratio * max(rainfall_24h_mm / 3.5, surge_height_m * 20.0), 1))
        is_intersecting = hazard_score > 30.0
    else:
        exposure_ratio = min(1.0, intersected_length / road_length) if road_length > 0 else (1.0 if is_intersecting else 0.0)
        hazard_score = round(min(100.0, max_hazard_score * max(0.4, exposure_ratio)), 1) if is_intersecting else 0.0

    status_label = "modeled_hazard_intersection" if is_intersecting else "unaffected_modeled_corridor"

    if is_intersecting:
        explanation = (
            f"Road Segment flagged for {status_label}: "
            f"{exposure_ratio*100:.0f}% of segment intersects modeled hazard extent "
            f"({', '.join(intersected_layers) if intersected_layers else 'Flood/Surge Zone'}). "
            f"Modeled hazard score {hazard_score}/100. {ROAD_ACCESSIBILITY_DISCLAIMER}"
        )
    else:
        explanation = (
            f"Road Segment is clear of modeled hazard extents. "
            f"Modeled hazard score 0.0/100. {ROAD_ACCESSIBILITY_DISCLAIMER}"
        )

    metadata = {
        "status": status_label,
        "is_intersecting": is_intersecting,
        "exposure_ratio": round(exposure_ratio, 2),
        "intersected_layers": intersected_layers,
        "disclaimer": ROAD_ACCESSIBILITY_DISCLAIMER
    }

    return is_intersecting, hazard_score, explanation, metadata
