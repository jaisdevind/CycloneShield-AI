import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class ScenarioModel(Base):
    __tablename__ = "scenarios"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # 'historical', 'hypothetical', 'live'
    region_id = Column(String, nullable=False, default="andhra_pradesh")
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    # Meteorological parameters
    max_wind_kmh = Column(Float, nullable=False)
    central_pressure_hpa = Column(Float, nullable=True)
    forecast_rainfall_24h_mm = Column(Float, nullable=False)
    storm_speed_kmh = Column(Float, default=18.0)
    current_lat = Column(Float, nullable=False)
    current_lon = Column(Float, nullable=False)
    track_points = Column(JSON, nullable=False)  # list of {lat, lon, time, wind_kmh, intensity}
    forecast_cone = Column(JSON, nullable=True)   # polygon coordinates or radii
    source_attribution = Column(String, default="IMD RSMC Demonstration Scenario")
    data_timestamp = Column(String, nullable=False)


class DataSourceModel(Base):
    __tablename__ = "data_sources"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    provider = Column(String, nullable=False)  # e.g., "Google Earth Engine", "NASA/USGS", "ESA", "OpenStreetMap", "IMD"
    dataset_identifier = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    spatial_resolution = Column(String, nullable=True)  # e.g., "30m", "10m", "Vector"
    temporal_coverage = Column(String, nullable=True)
    update_frequency = Column(String, nullable=True)
    intended_use = Column(String, nullable=True)
    limitations = Column(Text, nullable=True)
    status = Column(String, default="active")  # 'active', 'degraded', 'mock_fallback'
    last_sync = Column(DateTime, default=datetime.datetime.utcnow)
    is_live = Column(Boolean, default=False)


class InfrastructureModel(Base):
    __tablename__ = "infrastructure"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)  # 'hospital', 'shelter', 'road', 'bridge', 'power_substation', 'port'
    region_id = Column(String, nullable=False, default="andhra_pradesh")
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    district = Column(String, nullable=False)  # e.g., 'Visakhapatnam', 'Kakinada', 'Krishna', 'Nellore'
    elevation_m = Column(Float, default=5.0)
    distance_to_coast_km = Column(Float, default=2.0)
    capacity = Column(Integer, nullable=True)  # beds for hospitals, people for shelters
    structural_type = Column(String, nullable=True)  # 'reinforced_concrete', 'masonry', 'paved_asphalt'
    data_source = Column(String, default="OpenStreetMap & APSDMA Designated Centers")
    data_quality_status = Column(String, default="verified")  # 'verified', 'crowdsourced', 'synthetic'
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class RiskAssessmentModel(Base):
    __tablename__ = "risk_assessments"

    id = Column(String, primary_key=True, index=True)
    scenario_id = Column(String, ForeignKey("scenarios.id"), nullable=False)
    asset_id = Column(String, ForeignKey("infrastructure.id"), nullable=False)
    
    # Sub-scores (0.0 to 100.0)
    rainfall_flood_score = Column(Float, nullable=False)
    coastal_surge_score = Column(Float, nullable=False)
    wind_exposure_score = Column(Float, nullable=False)
    composite_risk_score = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)  # 'Low', 'Moderate', 'High', 'Critical'
    
    explanation = Column(Text, nullable=False)
    calculated_at = Column(DateTime, default=datetime.datetime.utcnow)


class SimulationRunModel(Base):
    __tablename__ = "simulation_runs"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    region_id = Column(String, default="andhra_pradesh")
    wind_speed_kmh = Column(Float, nullable=False)
    rainfall_24h_mm = Column(Float, nullable=False)
    surge_height_m = Column(Float, nullable=False)
    duration_hours = Column(Integer, default=24)
    custom_weights = Column(JSON, nullable=True)  # {flood: 0.35, surge: 0.35, wind: 0.30}
    
    # Results summary
    high_risk_assets_count = Column(Integer, default=0)
    moderate_risk_assets_count = Column(Integer, default=0)
    low_risk_assets_count = Column(Integer, default=0)
    estimated_exposed_population = Column(Integer, default=0)
    flagged_road_segments = Column(Integer, default=0)
    
    parameters_summary = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AdvisoryDraftModel(Base):
    __tablename__ = "advisory_drafts"

    id = Column(String, primary_key=True, index=True)
    scenario_id = Column(String, ForeignKey("scenarios.id"), nullable=False)
    region_id = Column(String, default="andhra_pradesh")
    audience = Column(String, nullable=False)  # 'general_public', 'fishermen', 'collectors_responders', 'port_operators'
    language = Column(String, nullable=False, default="en")  # 'en', 'te' (Telugu)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    evidence_summary = Column(Text, nullable=True)
    uncertainty_statement = Column(Text, nullable=True)
    
    # Workflow status
    status = Column(String, default="draft")  # 'draft', 'in_review', 'approved', 'rejected'
    approved_by = Column(String, nullable=True)
    approved_at = Column(DateTime, nullable=True)
    review_notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
