"""
Analytics API endpoints
"""
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from modules.analytics.aggregators import (CostAnalyzer, HeatmapAnalyzer,
                                           UtilizationAnalyzer)

router = APIRouter()


@router.get("/analytics/utilization/daily")
async def get_daily_utilization(
    asset_id: str = Query(..., description="Asset ID"),
    date: str = Query(..., description="Date in YYYY-MM-DD format"),
):
    """Get daily utilization analytics for an asset"""
    try:
        date_obj = datetime.fromisoformat(date)
        analyzer = UtilizationAnalyzer()

        metrics = await analyzer.calculate_daily_utilization(asset_id, date_obj)

        return {
            "asset_id": metrics.asset_id,
            "date": metrics.date.isoformat(),
            "hours_active": metrics.hours_active,
            "total_distance": metrics.total_distance,
            "utilization_rate": metrics.utilization_rate,
            "unique_gateways": metrics.unique_gateways,
            "movement_events": metrics.movement_events,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {e}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating daily utilization: {str(e)}"
        )


@router.get("/analytics/utilization/weekly")
async def get_weekly_utilization(
    asset_id: str = Query(..., description="Asset ID"),
    week_start: str = Query(..., description="Week start date in YYYY-MM-DD format"),
):
    """Get weekly utilization analytics for an asset"""
    try:
        week_start_obj = datetime.fromisoformat(week_start)
        analyzer = UtilizationAnalyzer()

        metrics = await analyzer.calculate_weekly_utilization(asset_id, week_start_obj)

        return metrics

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {e}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating weekly utilization: {str(e)}"
        )


@router.get("/analytics/utilization/monthly")
async def get_monthly_utilization(
    asset_id: str = Query(..., description="Asset ID"),
    month: int = Query(..., ge=1, le=12, description="Month (1-12)"),
    year: int = Query(..., ge=2020, le=2030, description="Year"),
):
    """Get monthly utilization analytics for an asset"""
    try:
        analyzer = UtilizationAnalyzer()

        metrics = await analyzer.calculate_monthly_utilization(asset_id, month, year)

        return metrics

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating monthly utilization: {str(e)}"
        )


@router.get("/analytics/cost-tracking/asset")
async def get_asset_costs(
    asset_id: str = Query(..., description="Asset ID"),
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
):
    """Get cost tracking analytics for an asset"""
    try:
        start_date_obj = datetime.fromisoformat(start_date)
        end_date_obj = datetime.fromisoformat(end_date)

        analyzer = CostAnalyzer()
        costs = await analyzer.calculate_asset_costs(
            asset_id, start_date_obj, end_date_obj
        )

        return {
            "asset_id": costs.asset_id,
            "period_start": costs.period_start.isoformat(),
            "period_end": costs.period_end.isoformat(),
            "total_cost": costs.total_cost,
            "utilization_cost": costs.utilization_cost,
            "maintenance_cost": costs.maintenance_cost,
            "fuel_cost": costs.fuel_cost,
            "depreciation_cost": costs.depreciation_cost,
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {e}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating asset costs: {str(e)}"
        )


@router.get("/analytics/cost-tracking/organization")
async def get_organization_costs(
    organization_id: str = Query(..., description="Organization ID"),
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
):
    """Get cost tracking analytics for an organization"""
    try:
        start_date_obj = datetime.fromisoformat(start_date)
        end_date_obj = datetime.fromisoformat(end_date)

        analyzer = CostAnalyzer()
        costs = await analyzer.calculate_organization_costs(
            organization_id, start_date_obj, end_date_obj
        )

        return costs

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {e}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error calculating organization costs: {str(e)}"
        )


@router.get("/analytics/heatmap")
async def get_heatmap_data(
    organization_id: str = Query(..., description="Organization ID"),
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: str = Query(..., description="End date in YYYY-MM-DD format"),
    grid_size: float = Query(
        0.001, ge=0.0001, le=0.01, description="Grid size in degrees"
    ),
):
    """Get location heatmap data"""
    try:
        start_date_obj = datetime.fromisoformat(start_date)
        end_date_obj = datetime.fromisoformat(end_date)

        analyzer = HeatmapAnalyzer()
        heatmap = await analyzer.generate_location_heatmap(
            organization_id, start_date_obj, end_date_obj, grid_size
        )

        return heatmap

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {e}")
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating heatmap: {str(e)}"
        )


@router.get("/analytics/summary")
async def get_analytics_summary(
    organization_id: str = Query(..., description="Organization ID"),
    period_days: int = Query(30, ge=1, le=365, description="Period in days"),
):
    """Get analytics summary for an organization"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=period_days)

        # Get utilization summary
        utilization_analyzer = UtilizationAnalyzer()

        # Get cost summary
        cost_analyzer = CostAnalyzer()
        costs = await cost_analyzer.calculate_organization_costs(
            organization_id, start_date, end_date
        )

        # Get heatmap summary
        heatmap_analyzer = HeatmapAnalyzer()
        heatmap = await heatmap_analyzer.generate_location_heatmap(
            organization_id, start_date, end_date, grid_size=0.01
        )

        return {
            "organization_id": organization_id,
            "period_start": start_date.isoformat(),
            "period_end": end_date.isoformat(),
            "period_days": period_days,
            "costs": {
                "total_cost": costs.get("total_cost", 0),
                "utilization_cost": costs.get("utilization_cost", 0),
                "maintenance_cost": costs.get("maintenance_cost", 0),
                "fuel_cost": costs.get("fuel_cost", 0),
                "depreciation_cost": costs.get("depreciation_cost", 0),
                "asset_count": costs.get("asset_count", 0),
            },
            "heatmap": {
                "total_points": heatmap.get("total_points", 0),
                "top_locations": heatmap.get("heatmap_data", [])[
                    :10
                ],  # Top 10 locations
            },
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating analytics summary: {str(e)}"
        )


@router.post("/analytics/predict")
async def get_ml_predictions(
    prediction_type: str = Query(
        ..., description="Type of prediction: utilization, maintenance, location"
    ),
    asset_id: Optional[str] = Query(
        None, description="Asset ID for asset-specific predictions"
    ),
    organization_id: str = Query(..., description="Organization ID"),
    prediction_days: int = Query(
        7, ge=1, le=30, description="Number of days to predict"
    ),
):
    """Get ML predictions"""
    try:
        from ml.serving.model_server import model_server

        if prediction_type == "utilization":
            # Utilization predictions (simplified for now)
            return {
                "prediction_type": "utilization",
                "asset_id": asset_id,
                "organization_id": organization_id,
                "prediction_days": prediction_days,
                "predictions": [
                    {
                        "date": (datetime.now() + timedelta(days=i)).isoformat(),
                        "predicted_utilization_rate": 0.75 + (i * 0.05),  # Mock data
                        "confidence": 0.85,
                    }
                    for i in range(prediction_days)
                ],
                "model_version": "v1.0",
                "last_trained": datetime.now().isoformat(),
            }

        elif prediction_type == "maintenance":
            if not asset_id:
                raise HTTPException(
                    status_code=400,
                    detail="Asset ID required for maintenance predictions",
                )

            # Use actual ML model for maintenance prediction
            result = await model_server.predict_maintenance(asset_id)

            if not result["success"]:
                raise HTTPException(
                    status_code=500, detail=result.get("message", "Prediction failed")
                )

            return {
                "prediction_type": "maintenance",
                "asset_id": asset_id,
                "organization_id": organization_id,
                "predictions": [result["prediction"]],
                "model_version": result.get("model_version", "v1.0"),
                "last_trained": result.get("last_trained", datetime.now().isoformat()),
            }

        elif prediction_type == "location":
            if not asset_id:
                raise HTTPException(
                    status_code=400, detail="Asset ID required for location predictions"
                )

            # Use actual ML model for location prediction
            result = await model_server.predict_location(asset_id, prediction_days)

            if not result["success"]:
                raise HTTPException(
                    status_code=500, detail=result.get("message", "Prediction failed")
                )

            # Format predictions with dates
            formatted_predictions = []
            for i, pred in enumerate(result["predictions"]):
                formatted_predictions.append(
                    {
                        "date": (datetime.now() + timedelta(days=i + 1)).isoformat(),
                        "predicted_latitude": pred["latitude"],
                        "predicted_longitude": pred["longitude"],
                        "confidence": pred["confidence"],
                    }
                )

            return {
                "prediction_type": "location",
                "asset_id": asset_id,
                "organization_id": organization_id,
                "prediction_days": prediction_days,
                "predictions": formatted_predictions,
                "model_version": result.get("model_version", "v1.0"),
                "last_trained": result.get("last_trained", datetime.now().isoformat()),
            }

        else:
            raise HTTPException(status_code=400, detail="Invalid prediction type")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating predictions: {str(e)}"
        )


@router.get("/analytics/trends")
async def get_analytics_trends(
    organization_id: str = Query(..., description="Organization ID"),
    trend_type: str = Query(
        ..., description="Type of trend: utilization, cost, movement"
    ),
    period_days: int = Query(30, ge=7, le=365, description="Period in days"),
):
    """Get analytics trends"""
    try:
        end_date = datetime.now()
        start_date = end_date - timedelta(days=period_days)

        if trend_type == "utilization":
            # Mock utilization trend data
            trend_data = []
            for i in range(period_days):
                date = start_date + timedelta(days=i)
                trend_data.append(
                    {
                        "date": date.isoformat(),
                        "average_utilization_rate": 0.6
                        + (i % 7) * 0.1,  # Mock weekly pattern
                        "total_assets_active": 25 + (i % 5) * 2,
                    }
                )

            return {
                "trend_type": "utilization",
                "organization_id": organization_id,
                "period_start": start_date.isoformat(),
                "period_end": end_date.isoformat(),
                "trend_data": trend_data,
            }

        elif trend_type == "cost":
            # Mock cost trend data
            trend_data = []
            for i in range(period_days):
                date = start_date + timedelta(days=i)
                trend_data.append(
                    {
                        "date": date.isoformat(),
                        "daily_cost": 1000 + (i % 7) * 200,  # Mock weekly pattern
                        "cost_per_asset": 40 + (i % 5) * 5,
                    }
                )

            return {
                "trend_type": "cost",
                "organization_id": organization_id,
                "period_start": start_date.isoformat(),
                "period_end": end_date.isoformat(),
                "trend_data": trend_data,
            }

        elif trend_type == "movement":
            # Mock movement trend data
            trend_data = []
            for i in range(period_days):
                date = start_date + timedelta(days=i)
                trend_data.append(
                    {
                        "date": date.isoformat(),
                        "total_distance": 5000 + (i % 7) * 1000,  # Mock weekly pattern
                        "movement_events": 150 + (i % 5) * 20,
                    }
                )

            return {
                "trend_type": "movement",
                "organization_id": organization_id,
                "period_start": start_date.isoformat(),
                "period_end": end_date.isoformat(),
                "trend_data": trend_data,
            }

        else:
            raise HTTPException(status_code=400, detail="Invalid trend type")

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error generating trends: {str(e)}"
        )


@router.post("/analytics/ml/train/location")
async def train_location_model(
    asset_id: str = Query(..., description="Asset ID to train model for"),
    days_back: int = Query(
        30, ge=7, le=365, description="Days of historical data to use for training"
    ),
):
    """Train location prediction model for an asset"""
    try:
        from ml.serving.model_server import model_server

        result = await model_server.train_location_model(asset_id, days_back)

        if not result["success"]:
            raise HTTPException(
                status_code=500, detail=result.get("message", "Training failed")
            )

        return {
            "success": True,
            "asset_id": asset_id,
            "training_metrics": result["metrics"],
            "training_samples": result["training_samples"],
            "model_path": result["model_path"],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error training location model: {str(e)}"
        )


@router.post("/analytics/ml/train/maintenance")
async def train_maintenance_model(
    organization_id: str = Query(..., description="Organization ID to train model for")
):
    """Train maintenance prediction model for an organization"""
    try:
        from ml.serving.model_server import model_server

        result = await model_server.train_maintenance_model(organization_id)

        if not result["success"]:
            raise HTTPException(
                status_code=500, detail=result.get("message", "Training failed")
            )

        return {
            "success": True,
            "organization_id": organization_id,
            "training_metrics": result["metrics"],
            "training_samples": result["training_samples"],
            "model_path": result["model_path"],
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error training maintenance model: {str(e)}"
        )


@router.get("/analytics/ml/status")
async def get_ml_model_status():
    """Get status of ML models"""
    try:
        from ml.serving.model_server import model_server

        status = await model_server.get_model_status()

        return {"success": True, "models": status}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting model status: {str(e)}"
        )
