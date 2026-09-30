"""
Composite Risk Aggregation Module.

Concepts:
- Aggregates component hazard scores (flood, surge, wind) into a normalized composite risk score (0.0 - 100.0).
- Risk Tiers: Low, Moderate, High, Critical.
- Risk Thresholds and Weights are fully configurable via settings or request parameters.

Formulas:
- Total Weight = flood_weight + surge_weight + wind_weight
- Normalized Flood Weight = flood_weight / Total Weight
- Normalized Surge Weight = surge_weight / Total Weight
- Normalized Wind Weight = wind_weight / Total Weight
- Composite Score = round(Normalized Flood Weight * flood_score + Normalized Surge Weight * surge_score + Normalized Wind Weight * wind_score, 1)
- Risk Classification:
    * Composite >= Threshold High (default 75.0) -> Critical
    * Composite >= Threshold Moderate (default 50.0) -> High
    * Composite >= Threshold Low (default 25.0) -> Moderate
    * Otherwise -> Low

Assumptions:
- Linear weighted combination reflects multi-hazard compound exposure.
- Standard risk boundaries (0-25 Low, 25-50 Moderate, 50-75 High, 75-100 Critical) provide clear decision-support tiers for responders.

Limitations:
- Heuristic composite screening index.
- Does NOT replace rigorous quantitative probabilistic loss modeling or structural fragility curves.
"""

from typing import Tuple, Dict, Any, Optional
from app.core.config import settings
from app.schemas.schemas import RiskWeightConfig

def calculate_composite_risk(
    flood_score: float,
    surge_score: float,
    wind_score: float,
    weights: Optional[RiskWeightConfig] = None,
    threshold_low: int = None,
    threshold_moderate: int = None,
    threshold_high: int = None
) -> Tuple[float, str, str, Dict[str, Any]]:
    """
    Calculates composite risk score and assigns risk tier level.

    Returns:
        Tuple containing:
        - composite_score (float 0-100)
        - risk_level (str: "Low" | "Moderate" | "High" | "Critical")
        - summary_explanation (str)
        - metadata (Dict)
    """
    w = weights or RiskWeightConfig(
        flood_weight=getattr(settings, "RISK_WEIGHT_FLOOD", 1.0),
        surge_weight=getattr(settings, "RISK_WEIGHT_SURGE", 1.0),
        wind_weight=getattr(settings, "RISK_WEIGHT_WIND", 1.0)
    )

    t_low = threshold_low if threshold_low is not None else getattr(settings, "RISK_THRESHOLD_LOW", 25)
    t_mod = threshold_moderate if threshold_moderate is not None else getattr(settings, "RISK_THRESHOLD_MODERATE", 50)
    t_high = threshold_high if threshold_high is not None else getattr(settings, "RISK_THRESHOLD_HIGH", 75)

    total_weight = max(0.001, w.flood_weight + w.surge_weight + w.wind_weight)
    norm_flood_w = w.flood_weight / total_weight
    norm_surge_w = w.surge_weight / total_weight
    norm_wind_w = w.wind_weight / total_weight

    raw_composite = (
        norm_flood_w * max(0.0, flood_score) +
        norm_surge_w * max(0.0, surge_score) +
        norm_wind_w * max(0.0, wind_score)
    )
    composite_score = round(min(100.0, max(0.0, raw_composite)), 1)

    # Classify Risk Tier
    if composite_score >= t_high:
        risk_level = "Critical"
    elif composite_score >= t_mod:
        risk_level = "High"
    elif composite_score >= t_low:
        risk_level = "Moderate"
    else:
        risk_level = "Low"

    summary_explanation = (
        f"Composite Risk Score: {composite_score}/100 [{risk_level}]. "
        f"Weighted hazard contribution: Flood ({flood_score:.1f} @ {norm_flood_w*100:.0f}%), "
        f"Surge ({surge_score:.1f} @ {norm_surge_w*100:.0f}%), "
        f"Wind ({wind_score:.1f} @ {norm_wind_w*100:.0f}%)."
    )

    metadata = {
        "weights": {
            "flood_weight": w.flood_weight,
            "surge_weight": w.surge_weight,
            "wind_weight": w.wind_weight,
            "normalized_flood_percent": round(norm_flood_w * 100, 1),
            "normalized_surge_percent": round(norm_surge_w * 100, 1),
            "normalized_wind_percent": round(norm_wind_w * 100, 1)
        },
        "thresholds": {
            "low": t_low,
            "moderate": t_mod,
            "high": t_high
        }
    }

    return composite_score, risk_level, summary_explanation, metadata
