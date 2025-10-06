"""
Streaming processors API endpoints
"""
from datetime import datetime
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from streaming.processors.anomaly_processor import get_anomaly_processor
from streaming.processors.geofence_processor import get_geofence_processor
from streaming.processors.location_processor import get_location_processor
from streaming.stream_processor_coordinator import (
    StreamProcessorCoordinator,
    get_stream_coordinator,
)

router = APIRouter()


@router.get("/streaming/status")
async def get_streaming_status(
    coordinator: StreamProcessorCoordinator = Depends(get_stream_coordinator),
):
    """Get status of all streaming processors"""
    try:
        stats = await coordinator.get_all_processor_stats()
        health = await coordinator.health_check()

        return {
            "status": "operational",
            "health": health,
            "statistics": stats,
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting streaming status: {str(e)}"
        )


@router.get("/streaming/processors/{processor_name}/stats")
async def get_processor_stats(
    processor_name: str,
    coordinator: StreamProcessorCoordinator = Depends(get_stream_coordinator),
):
    """Get statistics for a specific processor"""
    try:
        if processor_name not in ["location", "anomaly", "geofence"]:
            raise HTTPException(status_code=400, detail="Invalid processor name")

        # Get the specific processor
        if processor_name == "location":
            processor = await get_location_processor()
        elif processor_name == "anomaly":
            processor = await get_anomaly_processor()
        elif processor_name == "geofence":
            processor = await get_geofence_processor()

        stats = await processor.get_processing_stats()

        return {
            "processor_name": processor_name,
            "statistics": stats,
            "timestamp": datetime.now().isoformat(),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting processor stats: {str(e)}"
        )


@router.post("/streaming/processors/{processor_name}/restart")
async def restart_processor(
    processor_name: str,
    coordinator: StreamProcessorCoordinator = Depends(get_stream_coordinator),
):
    """Restart a specific processor"""
    try:
        if processor_name not in ["location", "anomaly", "geofence"]:
            raise HTTPException(status_code=400, detail="Invalid processor name")

        success = await coordinator.restart_processor(processor_name)

        if success:
            return {
                "message": f"Processor {processor_name} restarted successfully",
                "processor_name": processor_name,
                "timestamp": datetime.now().isoformat(),
            }
        else:
            raise HTTPException(
                status_code=500, detail=f"Failed to restart processor {processor_name}"
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error restarting processor: {str(e)}"
        )


@router.put("/streaming/processors/anomaly/config")
async def update_anomaly_processor_config(
    anomaly_threshold: float = Query(
        ..., ge=0.0, le=1.0, description="New anomaly threshold"
    ),
    coordinator: StreamProcessorCoordinator = Depends(get_stream_coordinator),
):
    """Update anomaly processor configuration"""
    try:
        config = {"anomaly_threshold": anomaly_threshold}
        success = await coordinator.update_processor_config("anomaly", config)

        if success:
            return {
                "message": "Anomaly processor configuration updated",
                "config": config,
                "timestamp": datetime.now().isoformat(),
            }
        else:
            raise HTTPException(
                status_code=500,
                detail="Failed to update anomaly processor configuration",
            )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error updating processor config: {str(e)}"
        )


@router.post("/streaming/processors/anomaly/force-detection")
async def force_anomaly_detection(
    asset_id: str = Query(..., description="Asset ID to force anomaly detection for"),
    coordinator: StreamProcessorCoordinator = Depends(get_stream_coordinator),
):
    """Force anomaly detection for a specific asset"""
    try:
        anomaly_processor = await get_anomaly_processor()
        result = await anomaly_processor.force_anomaly_detection(asset_id)

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error forcing anomaly detection: {str(e)}"
        )


@router.post("/streaming/processors/geofence/force-evaluation")
async def force_geofence_evaluation(
    asset_id: str = Query(..., description="Asset ID to force geofence evaluation for"),
    latitude: float = Query(..., description="Latitude for evaluation"),
    longitude: float = Query(..., description="Longitude for evaluation"),
    coordinator: StreamProcessorCoordinator = Depends(get_stream_coordinator),
):
    """Force geofence evaluation for a specific asset and location"""
    try:
        geofence_processor = await get_geofence_processor()
        result = await geofence_processor.force_geofence_evaluation(
            asset_id, latitude, longitude
        )

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error forcing geofence evaluation: {str(e)}"
        )


@router.get("/streaming/health")
async def streaming_health_check(
    coordinator: StreamProcessorCoordinator = Depends(get_stream_coordinator),
):
    """Health check for streaming processors"""
    try:
        health = await coordinator.health_check()

        return health

    except Exception as e:
        return {
            "overall_status": "error",
            "error": str(e),
            "timestamp": datetime.now().isoformat(),
        }
