"""
Asset Tag Backend - Simplified FastAPI Application for Testing
"""

import logging
import time

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title="Asset Tag Backend API",
    description="Backend API for Asset Tag tracking system with Bluetooth location estimation",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
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
async def add_process_time_header(request: Request, call_next) -> None:
    """Add processing time to response headers"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> None:
    """Global exception handler"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500, content={"error": "Internal server error", "message": str(exc)}
    )


# Health check endpoint
@app.get("/health")
async def health_check() -> None:
    """Health check endpoint"""
    return {"status": "healthy", "environment": "local", "timestamp": time.time()}


# Root endpoint
@app.get("/")
async def root() -> None:
    """Root endpoint"""
    return {
        "message": "Asset Tag Backend API",
        "version": "1.0.0",
        "environment": "local",
        "docs_url": "/docs",
    }


# Simple API endpoints for testing
@app.get("/api/v1/assets")
async def get_assets() -> None:
    """Get list of assets"""
    return {
        "assets": [
            {
                "id": "asset-001",
                "name": "Test Excavator",
                "serial_number": "EXC-001",
                "asset_type": "equipment",
                "status": "active",
                "location": "Site A",
                "battery_level": 85,
                "last_seen": "2 minutes ago",
            },
            {
                "id": "asset-002",
                "name": "Test Truck",
                "serial_number": "TRK-002",
                "asset_type": "vehicle",
                "status": "active",
                "location": "Site B",
                "battery_level": 92,
                "last_seen": "1 minute ago",
            },
        ]
    }


@app.get("/api/v1/assets/{asset_id}")
async def get_asset(asset_id: str) -> None:
    """Get asset by ID"""
    return {
        "id": asset_id,
        "name": f"Asset {asset_id}",
        "serial_number": f"SN-{asset_id}",
        "asset_type": "equipment",
        "status": "active",
        "location": "Site A",
        "battery_level": 85,
        "last_seen": "2 minutes ago",
    }


@app.get("/api/v1/alerts")
async def get_alerts() -> None:
    """Get list of alerts"""
    return {
        "alerts": [
            {
                "id": "alert-001",
                "type": "battery_low",
                "severity": "warning",
                "message": "Asset EXC-001 battery is low (15%)",
                "asset_id": "asset-001",
                "timestamp": "2024-01-01T10:30:00Z",
                "status": "active",
            }
        ]
    }


@app.get("/api/v1/sites")
async def get_sites() -> None:
    """Get list of sites"""
    return {
        "sites": [
            {
                "id": "site-001",
                "name": "Construction Site A",
                "location": "123 Main St, City, State",
                "status": "active",
                "asset_count": 5,
            }
        ]
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main-simple:app", host="127.0.0.1", port=8000, reload=True, log_level="info"
    )
