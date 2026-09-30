import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.init_db import init_database
from app.api.endpoints import router as api_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("cycloneshield")

# Ensure database tables exist and default seed data is present
init_database()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "CycloneShield AI — Geospatial cyclone risk, infrastructure vulnerability, "
        "and human-in-the-loop advisory engine for Coastal Andhra Pradesh."
    ),
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for frontend communication using configurable origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception Handler for Validation Errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={
            "error": "Validation Error",
            "detail": exc.errors(),
            "path": request.url.path
        }
    )

# Exception Handler for Unhandled Server Errors
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal Server Error",
            "detail": "An unexpected error occurred. Please try again later.",
            "path": request.url.path
        }
    )

# Register API Router
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/", tags=["System"])
def root():
    """Service status and OpenAPI sitemap links."""
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "online",
        "docs": "/docs",
        "health": f"{settings.API_PREFIX}/health"
    }

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
