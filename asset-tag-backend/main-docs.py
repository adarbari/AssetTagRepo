"""
Asset Tag Backend - FastAPI Application for Documentation
This version works without database dependencies for API documentation
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Asset Tag Backend API",
    description="Backend API for Asset Tag tracking system with Bluetooth location estimation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
            "message": str(exc)
        }
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "environment": "local",
        "timestamp": time.time()
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Asset Tag Backend API",
        "version": "1.0.0",
        "environment": "local",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

# Import and include all API routers
try:
    # Core API routes
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

    # Advanced API routes
    from modules.search.api import router as search_router
    from ml.features.api import router as features_router
    from ml.serving.api import router as ml_serving_router
    from modules.audit.api import router as audit_router
    from streaming.api import router as streaming_router
    from modules.websocket.api import router as websocket_router

    # Include all routers
    app.include_router(assets_router, prefix="/api/v1", tags=["assets"])
    app.include_router(sites_router, prefix="/api/v1", tags=["sites"])
    app.include_router(gateways_router, prefix="/api/v1", tags=["gateways"])
    app.include_router(observations_router, prefix="/api/v1", tags=["observations"])
    app.include_router(locations_router, prefix="/api/v1", tags=["locations"])
    app.include_router(geofences_router, prefix="/api/v1", tags=["geofences"])
    app.include_router(alerts_router, prefix="/api/v1", tags=["alerts"])
    app.include_router(jobs_router, prefix="/api/v1", tags=["jobs"])
    app.include_router(maintenance_router, prefix="/api/v1", tags=["maintenance"])
    app.include_router(analytics_router, prefix="/api/v1", tags=["analytics"])
    app.include_router(checkin_checkout_router, prefix="/api/v1", tags=["checkin-checkout"])
    app.include_router(vehicles_router, prefix="/api/v1", tags=["vehicles"])
    app.include_router(users_router, prefix="/api/v1", tags=["users"])
    app.include_router(issues_router, prefix="/api/v1", tags=["issues"])
    app.include_router(compliance_router, prefix="/api/v1", tags=["compliance"])
    app.include_router(reports_router, prefix="/api/v1", tags=["reports"])
    app.include_router(search_router, prefix="/api/v1", tags=["search"])
    app.include_router(features_router, prefix="/api/v1", tags=["features"])
    app.include_router(ml_serving_router, prefix="/api/v1", tags=["ml"])
    app.include_router(audit_router, prefix="/api/v1", tags=["audit"])
    app.include_router(streaming_router, prefix="/api/v1", tags=["streaming"])
    app.include_router(websocket_router, tags=["websocket"])

    logger.info("✅ All API modules loaded successfully")

except Exception as e:
    logger.error(f"❌ Error loading API modules: {e}")
    # Add a simple endpoint to show the error
    @app.get("/api/error")
    async def show_error():
        return {"error": f"Failed to load API modules: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Asset Tag Backend Server (Documentation Mode)...")
    print("📚 FastAPI Docs: http://localhost:8000/docs")
    print("📖 ReDoc: http://localhost:8000/redoc")
    print("🔗 OpenAPI JSON: http://localhost:8000/openapi.json")
    uvicorn.run(
        "main-docs:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
