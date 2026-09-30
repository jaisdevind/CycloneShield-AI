import logging
from sqlalchemy.orm import Session
from app.core.database import engine, Base, SessionLocal
from app.models.models import ScenarioModel, DataSourceModel, InfrastructureModel, AdvisoryDraftModel
from app.services.weather.service import weather_service
from app.services.gee.service import GEE_DATASET_CATALOG
from app.services.infrastructure.service import COASTAL_AP_ASSETS

logger = logging.getLogger(__name__)

def seed_scenarios(db: Session):
    """Seeds default cyclone scenarios idempotently."""
    scenarios = weather_service.get_all_scenarios()
    for sc in scenarios:
        existing = db.query(ScenarioModel).filter(ScenarioModel.id == sc.id).first()
        if not existing:
            rec = ScenarioModel(
                id=sc.id,
                name=sc.name,
                category=sc.category,
                region_id=sc.region_id,
                description=sc.description,
                is_active=sc.is_active,
                max_wind_kmh=sc.max_wind_kmh,
                central_pressure_hpa=sc.central_pressure_hpa,
                forecast_rainfall_24h_mm=sc.forecast_rainfall_24h_mm,
                storm_speed_kmh=sc.storm_speed_kmh,
                current_lat=sc.current_lat,
                current_lon=sc.current_lon,
                track_points=[tp.model_dump() for tp in sc.track_points],
                forecast_cone=sc.forecast_cone.model_dump() if sc.forecast_cone else None,
                source_attribution=sc.source_attribution,
                data_timestamp=sc.data_timestamp
            )
            db.add(rec)
    db.commit()

def seed_data_sources(db: Session):
    """Seeds default Earth observation catalog data sources idempotently."""
    for ds in GEE_DATASET_CATALOG:
        existing = db.query(DataSourceModel).filter(DataSourceModel.id == ds["id"]).first()
        if not existing:
            rec = DataSourceModel(
                id=ds["id"],
                name=ds["name"],
                provider=ds["provider"],
                dataset_identifier=ds["dataset_identifier"],
                spatial_resolution=ds.get("spatial_resolution"),
                temporal_coverage=ds.get("temporal_coverage"),
                intended_use=ds.get("intended_use"),
                limitations=ds.get("limitations"),
                status=ds.get("status", "ready"),
                is_live=False
            )
            db.add(rec)
    db.commit()

def seed_infrastructure(db: Session):
    """Seeds default coastal Andhra Pradesh infrastructure assets idempotently."""
    for asset in COASTAL_AP_ASSETS:
        existing = db.query(InfrastructureModel).filter(InfrastructureModel.id == asset["id"]).first()
        if not existing:
            rec = InfrastructureModel(
                id=asset["id"],
                name=asset["name"],
                category=asset["category"],
                region_id=asset["region_id"],
                lat=asset["lat"],
                lon=asset["lon"],
                district=asset["district"],
                elevation_m=asset["elevation_m"],
                distance_to_coast_km=asset["distance_to_coast_km"],
                capacity=asset.get("capacity"),
                structural_type=asset.get("structural_type"),
                data_source=asset["data_source"],
                data_quality_status=asset["data_quality_status"]
            )
            db.add(rec)
    db.commit()

def init_database():
    """Initializes tables and seeds default records reproducibly."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_scenarios(db)
        seed_data_sources(db)
        seed_infrastructure(db)
        logger.info("CycloneShield SQLite database initialized and seeded successfully.")
        print("CycloneShield database schema verified, seeded, and initialized.")
    except Exception as e:
        logger.error(f"Error during database initialization: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    init_database()
