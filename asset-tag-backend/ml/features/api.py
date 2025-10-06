"""
Feature store API endpoints
"""

from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from ml.features.feature_store import (AssetBaseline, FeatureStore,
                                       FeatureVector, get_feature_store)

router = APIRouter()


@router.get("/features/{asset_id}")
async def get_features(
    asset_id: str, feature_store: FeatureStore = Depends(get_feature_store)
):
    """Get real-time features for an asset"""
    try:
        features = await feature_store.get_features(asset_id)

        if not features:
            raise HTTPException(status_code=404, detail="No features found for asset")

        return {
            "asset_id": asset_id,
            "timestamp": features.timestamp.isoformat(),
            "features": features.features,
            "metadata": features.metadata,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting features: {str(e)}")


@router.get("/features/{asset_id}/baseline")
async def get_baseline(
    asset_id: str, feature_store: FeatureStore = Depends(get_feature_store)
):
    """Get baseline features for an asset"""
    try:
        baseline = await feature_store.get_baseline(asset_id)

        if not baseline:
            raise HTTPException(status_code=404, detail="No baseline found for asset")

        return {"asset_id": asset_id, "baseline": baseline.to_dict()}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting baseline: {str(e)}")


@router.get("/features/{asset_id}/history")
async def get_feature_history(
    asset_id: str,
    hours: int = Query(24, ge=1, le=168, description="Hours of history to retrieve"),
    feature_store: FeatureStore = Depends(get_feature_store),
):
    """Get feature history for an asset"""
    try:
        history = await feature_store.get_feature_history(asset_id, hours)

        return {
            "asset_id": asset_id,
            "hours": hours,
            "feature_count": len(history),
            "features": [feature.to_dict() for feature in history],
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting feature history: {str(e)}"
        )


@router.post("/features/{asset_id}/invalidate")
async def invalidate_features(
    asset_id: str, feature_store: FeatureStore = Depends(get_feature_store)
):
    """Invalidate feature cache for an asset"""
    try:
        await feature_store.invalidate_cache(asset_id)

        return {
            "message": f"Feature cache invalidated for asset {asset_id}",
            "asset_id": asset_id,
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error invalidating features: {str(e)}"
        )


@router.get("/features/{asset_id}/anomaly-score")
async def get_anomaly_score(
    asset_id: str, feature_store: FeatureStore = Depends(get_feature_store)
):
    """Get anomaly score for an asset based on current features vs baseline"""
    try:
        # Get current features and baseline
        features = await feature_store.get_features(asset_id)
        baseline = await feature_store.get_baseline(asset_id)

        if not features or not baseline:
            raise HTTPException(
                status_code=404, detail="Features or baseline not found"
            )

        # Calculate simple anomaly score
        anomaly_score = await _calculate_anomaly_score(features, baseline)

        return {
            "asset_id": asset_id,
            "anomaly_score": anomaly_score,
            "timestamp": datetime.now().isoformat(),
            "is_anomalous": anomaly_score > 0.7,  # Threshold for anomaly
            "features": features.features,
            "baseline": baseline.to_dict(),
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating anomaly score: {str(e)}"
        )


@router.get("/features/batch")
async def get_batch_features(
    asset_ids: str = Query(..., description="Comma-separated list of asset IDs"),
    feature_store: FeatureStore = Depends(get_feature_store),
):
    """Get features for multiple assets"""
    try:
        asset_id_list = [aid.strip() for aid in asset_ids.split(",")]

        if len(asset_id_list) > 100:
            raise HTTPException(
                status_code=400, detail="Maximum 100 assets per batch request"
            )

        results = []
        for asset_id in asset_id_list:
            features = await feature_store.get_features(asset_id)
            if features:
                results.append(
                    {
                        "asset_id": asset_id,
                        "features": features.features,
                        "timestamp": features.timestamp.isoformat(),
                        "metadata": features.metadata,
                    }
                )

        return {
            "requested_count": len(asset_id_list),
            "returned_count": len(results),
            "features": results,
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting batch features: {str(e)}"
        )


async def _calculate_anomaly_score(
    features: FeatureVector, baseline: AssetBaseline
) -> float:
    """Calculate anomaly score between current features and baseline"""
    try:
        score = 0.0
        feature_count = 0

        # RSSI anomaly
        if "avg_rssi" in features.features:
            for gateway_id, baseline_rssi in baseline.avg_rssi_per_gateway.items():
                if gateway_id in features.features:
                    rssi_diff = abs(features.features["avg_rssi"] - baseline_rssi)
                    score += min(rssi_diff / 20.0, 1.0)  # Normalize by 20dB
                    feature_count += 1

        # Battery anomaly
        if "avg_battery" in features.features:
            battery_diff = abs(
                features.features["avg_battery"] - 80.0
            )  # Assume 80% is normal
            score += min(battery_diff / 50.0, 1.0)  # Normalize by 50%
            feature_count += 1

        # Temperature anomaly
        if "avg_temperature" in features.features:
            temp_diff = abs(
                features.features["avg_temperature"] - baseline.avg_temperature
            )
            score += min(temp_diff / 10.0, 1.0)  # Normalize by 10°C
            feature_count += 1

        # Confidence anomaly
        if "current_confidence" in features.features:
            conf_diff = abs(
                features.features["current_confidence"] - baseline.typical_confidence
            )
            score += min(conf_diff / 0.5, 1.0)  # Normalize by 0.5
            feature_count += 1

        # Movement anomaly
        if "current_speed" in features.features and baseline.typical_movement_pattern:
            speed_diff = abs(
                features.features["current_speed"]
                - baseline.typical_movement_pattern.get("avg_speed", 0)
            )
            score += min(speed_diff / 5.0, 1.0)  # Normalize by 5 m/s
            feature_count += 1

        # Return average anomaly score
        return score / max(feature_count, 1)

    except Exception as e:
        # Return neutral score on error
        return 0.5
