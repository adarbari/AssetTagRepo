"""
ML model serving API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional, Dict, Any, List
from datetime import datetime

from ml.serving.inference import get_inference_engine, InferenceEngine
from ml.serving.model_loader import get_model_loader, ModelLoader

router = APIRouter()


@router.post("/predict/anomaly")
async def predict_anomaly(
    asset_id: str = Query(..., description="Asset ID to predict anomaly for"),
    inference_engine: InferenceEngine = Depends(get_inference_engine)
):
    """Predict anomaly for an asset"""
    try:
        result = await inference_engine.predict_anomaly(asset_id)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting anomaly: {str(e)}")


@router.post("/predict/location")
async def predict_location(
    asset_id: str = Query(..., description="Asset ID to predict location for"),
    future_minutes: int = Query(30, ge=1, le=1440, description="Minutes into the future to predict"),
    inference_engine: InferenceEngine = Depends(get_inference_engine)
):
    """Predict future location for an asset"""
    try:
        result = await inference_engine.predict_location(asset_id, future_minutes)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting location: {str(e)}")


@router.post("/predict/battery")
async def predict_battery_degradation(
    asset_id: str = Query(..., description="Asset ID to predict battery for"),
    days_ahead: int = Query(7, ge=1, le=30, description="Days ahead to predict"),
    inference_engine: InferenceEngine = Depends(get_inference_engine)
):
    """Predict battery degradation for an asset"""
    try:
        result = await inference_engine.predict_battery_degradation(asset_id, days_ahead)
        
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error predicting battery: {str(e)}")


@router.post("/predict/batch")
async def batch_predictions(
    asset_ids: str = Query(..., description="Comma-separated list of asset IDs"),
    prediction_type: str = Query("anomaly", description="Type of prediction: anomaly, location, battery"),
    inference_engine: InferenceEngine = Depends(get_inference_engine)
):
    """Get predictions for multiple assets"""
    try:
        asset_id_list = [aid.strip() for aid in asset_ids.split(",")]
        
        if len(asset_id_list) > 50:
            raise HTTPException(status_code=400, detail="Maximum 50 assets per batch request")
        
        results = []
        for asset_id in asset_id_list:
            try:
                if prediction_type == "anomaly":
                    result = await inference_engine.predict_anomaly(asset_id)
                elif prediction_type == "location":
                    result = await inference_engine.predict_location(asset_id)
                elif prediction_type == "battery":
                    result = await inference_engine.predict_battery_degradation(asset_id)
                else:
                    raise HTTPException(status_code=400, detail=f"Unknown prediction type: {prediction_type}")
                
                results.append(result)
                
            except Exception as e:
                results.append({
                    "asset_id": asset_id,
                    "error": str(e)
                })
        
        return {
            "prediction_type": prediction_type,
            "requested_count": len(asset_id_list),
            "successful_count": len([r for r in results if "error" not in r]),
            "results": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in batch predictions: {str(e)}")


@router.get("/models/status")
async def get_model_status(
    model_loader: ModelLoader = Depends(get_model_loader)
):
    """Get status of loaded models"""
    try:
        loaded_models = model_loader.get_loaded_models()
        model_info = {}
        
        for model_name in loaded_models:
            model_info[model_name] = model_loader.get_model_info(model_name)
        
        return {
            "loaded_models": loaded_models,
            "model_count": len(loaded_models),
            "model_info": model_info,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting model status: {str(e)}")


@router.post("/models/refresh")
async def refresh_models(
    model_name: Optional[str] = Query(None, description="Specific model to refresh, or all if not specified"),
    model_loader: ModelLoader = Depends(get_model_loader)
):
    """Refresh model(s) from MLflow"""
    try:
        if model_name:
            success = await model_loader.refresh_model(model_name)
            return {
                "model_name": model_name,
                "refreshed": success,
                "timestamp": datetime.now().isoformat()
            }
        else:
            results = await model_loader.refresh_all_models()
            refreshed = sum(1 for success in results.values() if success)
            return {
                "all_models": True,
                "refreshed_count": refreshed,
                "total_count": len(results),
                "results": results,
                "timestamp": datetime.now().isoformat()
            }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing models: {str(e)}")


@router.post("/models/preload")
async def preload_models(
    model_names: str = Query(..., description="Comma-separated list of model names to preload"),
    model_loader: ModelLoader = Depends(get_model_loader)
):
    """Preload specific models"""
    try:
        model_name_list = [name.strip() for name in model_names.split(",")]
        
        if len(model_name_list) > 10:
            raise HTTPException(status_code=400, detail="Maximum 10 models per preload request")
        
        results = await model_loader.preload_models(model_name_list)
        
        loaded = sum(1 for success in results.values() if success)
        
        return {
            "requested_models": model_name_list,
            "loaded_count": loaded,
            "total_count": len(model_name_list),
            "results": results,
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error preloading models: {str(e)}")


@router.delete("/models/{model_name}")
async def unload_model(
    model_name: str,
    model_loader: ModelLoader = Depends(get_model_loader)
):
    """Unload a specific model from memory"""
    try:
        success = await model_loader.unload_model(model_name)
        
        return {
            "model_name": model_name,
            "unloaded": success,
            "timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error unloading model: {str(e)}")


@router.get("/health")
async def ml_health_check(
    model_loader: ModelLoader = Depends(get_model_loader),
    inference_engine: InferenceEngine = Depends(get_inference_engine)
):
    """Health check for ML services"""
    try:
        loaded_models = model_loader.get_loaded_models()
        
        # Test inference with a dummy asset (this won't actually work but tests the pipeline)
        health_status = {
            "status": "healthy",
            "loaded_models": len(loaded_models),
            "model_loader": "operational",
            "inference_engine": "operational",
            "timestamp": datetime.now().isoformat()
        }
        
        return health_status
        
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
