import os
from typing import List
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "CycloneShield AI"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    
    # CORS
    CORS_ORIGINS: List[str] = [
        x.strip() for x in os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,*").split(",") if x.strip()
    ]
    
    # Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # Google Earth Engine
    EE_PROJECT_ID: str = os.getenv("EE_PROJECT_ID", "")
    EE_SERVICE_ACCOUNT_EMAIL: str = os.getenv("EE_SERVICE_ACCOUNT_EMAIL", "")
    EE_PRIVATE_KEY_PATH: str = os.getenv("EE_PRIVATE_KEY_PATH", "")
    
    # Weather
    WEATHER_PROVIDER_MODE: str = os.getenv("WEATHER_PROVIDER_MODE", "demo")
    WEATHER_API_KEY: str = os.getenv("WEATHER_API_KEY", "")
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./cycloneshield.db")
    
    # Default Region: Coastal Andhra Pradesh
    DEFAULT_REGION_ID: str = os.getenv("DEFAULT_REGION_ID", "andhra_pradesh")
    DEFAULT_REGION_NAME: str = os.getenv("DEFAULT_REGION_NAME", "Coastal Andhra Pradesh, India")
    DEFAULT_REGION_BBOX: dict = {
        "min_lat": 13.5,
        "max_lat": 19.3,
        "min_lon": 79.8,
        "max_lon": 85.1,
        "center_lat": 16.5,
        "center_lon": 81.8,
        "zoom": 7
    }

settings = Settings()
