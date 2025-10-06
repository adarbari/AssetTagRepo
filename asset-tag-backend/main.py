"""
Asset Tag Backend - FastAPI Application
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
import time
from contextlib import asynccontextmanager

from config.settings import settings
from config.database import init_db, close_db
from config.cache import close_cache
from config.streaming import start_streaming, stop_streaming
from config.elasticsearch import close_elasticsearch
from ml.serving.model_loader import (
    start_model_refresh_scheduler,
    stop_model_refresh_scheduler,
    preload_common_models,
)
from streaming.stream_processor_coordinator import (
    start_all_stream_processors,
    stop_all_stream_processors,
)

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.log_level.upper()),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    logger.info("Starting Asset Tag Backend...")

    # Initialize database
    await init_db()
    logger.info("Database initialized")

    # Start streaming services
    await start_streaming()
    logger.info("Streaming services started")

    # Start enhanced stream processors
    await start_all_stream_processors()
    logger.info("Enhanced stream processors started")

    # Initialize Elasticsearch indices
    from config.elasticsearch import get_elasticsearch_manager

    es_manager = await get_elasticsearch_manager()
    await es_manager.create_indices()
    logger.info("Elasticsearch indices initialized")

    # Start ML model refresh scheduler
    await start_model_refresh_scheduler()
    logger.info("ML model refresh scheduler started")

    # Preload common ML models
    await preload_common_models()
    logger.info("Common ML models preloaded")

    yield

    # Shutdown
    logger.info("Shutting down Asset Tag Backend...")

    # Stop ML model refresh scheduler
    await stop_model_refresh_scheduler()
    logger.info("ML model refresh scheduler stopped")

    # Stop enhanced stream processors
    await stop_all_stream_processors()
    logger.info("Enhanced stream processors stopped")

    # Stop streaming services
    await stop_streaming()
    logger.info("Streaming services stopped")

    # Close database connections
    await close_db()
    logger.info("Database connections closed")

    # Close cache connections
    await close_cache()
    logger.info("Cache connections closed")

    # Close Elasticsearch connections
    await close_elasticsearch()
    logger.info("Elasticsearch connections closed")


# Create FastAPI application
app = FastAPI(
    title="Asset Tag Backend API",
    description="Backend API for Asset Tag tracking system with Bluetooth location estimation",
    version="1.0.0",
    docs_url="/docs" if settings.environment == "local" else None,
    redoc_url="/redoc" if settings.environment == "local" else None,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add trusted host middleware for production
if settings.environment == "production":
    app.add_middleware(
        TrustedHostMiddleware, allowed_hosts=["*.yourdomain.com", "yourdomain.com"]
    )


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add processing time to response headers"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred"
            if settings.environment == "production"
            else str(exc),
        },
    )


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": settings.environment,
        "timestamp": time.time(),
    }


# API v1 routes
from modules.assets.api import router as assets_router
from modules.sites.api import router as sites_router
from modules.gateways.api import router as gateways_router
from modules.observations.api import router as observations_router
from modules.locations.api import router as locations_router
from modules.geofences.api import router as geofences_router
from modules.alerts.api import router as alerts_router
from modules.jobs.api import router as jobs_router
from modules.maintenance.api import router as maintenance_router
from modules.analytics.api import router as analytics_router
from modules.checkin_checkout.api import router as checkin_checkout_router
from modules.vehicles.api import router as vehicles_router
from modules.users.api import router as users_router
from modules.issues.api import router as issues_router
from modules.compliance.api import router as compliance_router
from modules.reports.api import router as reports_router

# New API routes
from modules.search.api import router as search_router
from ml.features.api import router as features_router
from ml.serving.api import router as ml_serving_router
from modules.audit.api import router as audit_router
from streaming.api import router as streaming_router

# Include routers
app.include_router(assets_router, prefix=settings.api_v1_prefix, tags=["assets"])
app.include_router(sites_router, prefix=settings.api_v1_prefix, tags=["sites"])
app.include_router(gateways_router, prefix=settings.api_v1_prefix, tags=["gateways"])
app.include_router(
    observations_router, prefix=settings.api_v1_prefix, tags=["observations"]
)
app.include_router(locations_router, prefix=settings.api_v1_prefix, tags=["locations"])
app.include_router(geofences_router, prefix=settings.api_v1_prefix, tags=["geofences"])
app.include_router(alerts_router, prefix=settings.api_v1_prefix, tags=["alerts"])
app.include_router(jobs_router, prefix=settings.api_v1_prefix, tags=["jobs"])
app.include_router(
    maintenance_router, prefix=settings.api_v1_prefix, tags=["maintenance"]
)
app.include_router(analytics_router, prefix=settings.api_v1_prefix, tags=["analytics"])
app.include_router(
    checkin_checkout_router, prefix=settings.api_v1_prefix, tags=["checkin-checkout"]
)
app.include_router(vehicles_router, prefix=settings.api_v1_prefix, tags=["vehicles"])
app.include_router(users_router, prefix=settings.api_v1_prefix, tags=["users"])
app.include_router(issues_router, prefix=settings.api_v1_prefix, tags=["issues"])
app.include_router(
    compliance_router, prefix=settings.api_v1_prefix, tags=["compliance"]
)
app.include_router(reports_router, prefix=settings.api_v1_prefix, tags=["reports"])

# Include new routers
app.include_router(search_router, prefix=settings.api_v1_prefix, tags=["search"])
app.include_router(features_router, prefix=settings.api_v1_prefix, tags=["features"])
app.include_router(ml_serving_router, prefix=settings.api_v1_prefix, tags=["ml"])
app.include_router(audit_router, prefix=settings.api_v1_prefix, tags=["audit"])
app.include_router(streaming_router, prefix=settings.api_v1_prefix, tags=["streaming"])


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Asset Tag Backend API",
        "version": "1.0.0",
        "environment": settings.environment,
        "docs_url": "/docs" if settings.environment == "local" else None,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.environment == "local",
        log_level=settings.log_level.lower(),
    )
