"""
ML Model Serving Server
"""

import asyncio
import json
import logging
import os
from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from sqlalchemy import text

from config.database import get_db
from ml.models.location_predictor import LocationPredictor
from ml.models.maintenance_predictor import MaintenancePredictor

logger = logging.getLogger(__name__)


class ModelServer:
    """ML Model serving server for predictions"""

    def __init__(self):
        self.location_predictor = LocationPredictor()
        self.maintenance_predictor = MaintenancePredictor()
        self.models_loaded = False
        self.model_path = os.getenv("MODEL_PATH", "/tmp/models")

        # Ensure model directory exists
        os.makedirs(self.model_path, exist_ok=True)

    async def initialize_models(self):
        """Initialize and load models"""
        try:
            # Try to load existing models
            location_model_path = os.path.join(
                self.model_path, "location_predictor.joblib"
            )
            maintenance_model_path = os.path.join(
                self.model_path, "maintenance_predictor.joblib"
            )

            if os.path.exists(location_model_path):
                self.location_predictor.load_model(location_model_path)
                logger.info("Location predictor model loaded")
            else:
                logger.info("No existing location predictor model found")

            if os.path.exists(maintenance_model_path):
                self.maintenance_predictor.load_model(maintenance_model_path)
                logger.info("Maintenance predictor model loaded")
            else:
                logger.info("No existing maintenance predictor model found")

            self.models_loaded = True

        except Exception as e:
            logger.error(f"Error initializing models: {e}")
            self.models_loaded = False

    async def train_location_model(
        self, asset_id: str, days_back: int = 30
    ) -> Dict[str, Any]:
        """Train location prediction model for an asset"""
        try:
            db = await get_db()

            # Get historical location data
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)

            query = text(
                """
                SELECT 
                    estimated_at, latitude, longitude, rssi, gateway_ids,
                    distance_from_previous, battery_level, temperature
                FROM estimated_locations
                WHERE asset_id = :asset_id
                    AND estimated_at >= :start_date
                    AND estimated_at <= :end_date
                ORDER BY estimated_at
            """
            )

            result = await db.execute(
                query,
                {"asset_id": asset_id, "start_date": start_date, "end_date": end_date},
            )

            historical_data = []
            for row in result.fetchall():
                historical_data.append(
                    {
                        "estimated_at": row.estimated_at.isoformat(),
                        "latitude": float(row.latitude),
                        "longitude": float(row.longitude),
                        "rssi": row.rssi or -70,
                        "gateway_ids": row.gateway_ids or [],
                        "distance_from_previous": float(
                            row.distance_from_previous or 0
                        ),
                        "battery_level": row.battery_level or 50,
                        "temperature": row.temperature or 20,
                    }
                )

            if len(historical_data) < 10:
                return {
                    "success": False,
                    "message": f"Insufficient data for training. Need at least 10 records, got {len(historical_data)}",
                }

            # Train the model
            metrics = self.location_predictor.train(historical_data)

            # Save the model
            model_path = os.path.join(
                self.model_path, f"location_predictor_{asset_id}.joblib"
            )
            self.location_predictor.save_model(model_path)

            return {
                "success": True,
                "metrics": metrics,
                "training_samples": len(historical_data),
                "model_path": model_path,
            }

        except Exception as e:
            logger.error(f"Error training location model: {e}")
            return {"success": False, "error": str(e)}

    async def train_maintenance_model(self, organization_id: str) -> Dict[str, Any]:
        """Train maintenance prediction model for an organization"""
        try:
            db = await get_db()

            # Get maintenance history and asset data
            query = text(
                """
                SELECT 
                    mr.asset_id,
                    mr.maintenance_type,
                    mr.completed_date,
                    mr.actual_duration_hours,
                    mr.actual_cost,
                    a.created_at,
                    a.battery_cycles,
                    a.last_maintenance_date
                FROM maintenance_records mr
                JOIN assets a ON mr.asset_id = a.id
                WHERE a.organization_id = :organization_id
                    AND mr.completed_date IS NOT NULL
                ORDER BY mr.completed_date DESC
                LIMIT 1000
            """
            )

            result = await db.execute(query, {"organization_id": organization_id})

            training_data = []
            for row in result.fetchall():
                # Get historical data for this asset
                asset_historical = await self._get_asset_historical_data(
                    str(row.asset_id)
                )

                training_data.append(
                    {
                        "asset_data": {
                            "created_at": row.created_at,
                            "battery_cycles": row.battery_cycles or 0,
                            "last_maintenance_date": row.completed_date,
                            "maintenance_frequency": 2,  # Default
                        },
                        "historical_data": asset_historical,
                        "maintenance_type": row.maintenance_type,
                    }
                )

            if len(training_data) < 20:
                return {
                    "success": False,
                    "message": f"Insufficient maintenance data for training. Need at least 20 records, got {len(training_data)}",
                }

            # Train the model
            metrics = self.maintenance_predictor.train(training_data)

            # Save the model
            model_path = os.path.join(
                self.model_path, f"maintenance_predictor_{organization_id}.joblib"
            )
            self.maintenance_predictor.save_model(model_path)

            return {
                "success": True,
                "metrics": metrics,
                "training_samples": len(training_data),
                "model_path": model_path,
            }

        except Exception as e:
            logger.error(f"Error training maintenance model: {e}")
            return {"success": False, "error": str(e)}

    async def _get_asset_historical_data(self, asset_id: str) -> List[Dict]:
        """Get historical data for an asset"""
        try:
            db = await get_db()

            # Get last 30 days of location data
            end_date = datetime.now()
            start_date = end_date - timedelta(days=30)

            query = text(
                """
                SELECT 
                    estimated_at, latitude, longitude, rssi, gateway_ids,
                    distance_from_previous, battery_level, temperature
                FROM estimated_locations
                WHERE asset_id = :asset_id
                    AND estimated_at >= :start_date
                    AND estimated_at <= :end_date
                ORDER BY estimated_at
            """
            )

            result = await db.execute(
                query,
                {"asset_id": asset_id, "start_date": start_date, "end_date": end_date},
            )

            historical_data = []
            for row in result.fetchall():
                historical_data.append(
                    {
                        "estimated_at": row.estimated_at.isoformat(),
                        "hours_active": 1,  # Simplified
                        "total_distance": float(row.distance_from_previous or 0),
                        "temperature": row.temperature or 20,
                        "vibration": 0,  # Would come from sensors
                        "error_count": 0,  # Would come from error logs
                    }
                )

            return historical_data

        except Exception as e:
            logger.error(f"Error getting asset historical data: {e}")
            return []

    async def predict_location(
        self, asset_id: str, steps_ahead: int = 7
    ) -> Dict[str, Any]:
        """Predict future locations for an asset"""
        try:
            if not self.location_predictor.is_trained:
                return {
                    "success": False,
                    "message": "Location prediction model not trained",
                }

            db = await get_db()

            # Get recent location data for features
            end_date = datetime.now()
            start_date = end_date - timedelta(days=7)

            query = text(
                """
                SELECT 
                    estimated_at, latitude, longitude, rssi, gateway_ids,
                    distance_from_previous, battery_level, temperature
                FROM estimated_locations
                WHERE asset_id = :asset_id
                    AND estimated_at >= :start_date
                    AND estimated_at <= :end_date
                ORDER BY estimated_at DESC
                LIMIT 100
            """
            )

            result = await db.execute(
                query,
                {"asset_id": asset_id, "start_date": start_date, "end_date": end_date},
            )

            historical_data = []
            for row in result.fetchall():
                historical_data.append(
                    {
                        "estimated_at": row.estimated_at.isoformat(),
                        "latitude": float(row.latitude),
                        "longitude": float(row.longitude),
                        "rssi": row.rssi or -70,
                        "gateway_ids": row.gateway_ids or [],
                        "distance_from_previous": float(
                            row.distance_from_previous or 0
                        ),
                        "battery_level": row.battery_level or 50,
                        "temperature": row.temperature or 20,
                    }
                )

            if not historical_data:
                return {
                    "success": False,
                    "message": "No recent location data available for prediction",
                }

            # Prepare features
            features = self.location_predictor.prepare_features(historical_data)

            if features.empty:
                return {
                    "success": False,
                    "message": "Unable to prepare features for prediction",
                }

            # Make predictions
            predictions = self.location_predictor.predict(features, steps_ahead)

            return {
                "success": True,
                "asset_id": asset_id,
                "predictions": predictions,
                "model_version": "v1.0",
                "last_trained": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error predicting locations: {e}")
            return {"success": False, "error": str(e)}

    async def predict_maintenance(self, asset_id: str) -> Dict[str, Any]:
        """Predict maintenance needs for an asset"""
        try:
            if not self.maintenance_predictor.is_trained:
                return {
                    "success": False,
                    "message": "Maintenance prediction model not trained",
                }

            db = await get_db()

            # Get asset data
            asset_query = text(
                """
                SELECT id, created_at, battery_cycles, last_maintenance_date
                FROM assets
                WHERE id = :asset_id
            """
            )

            asset_result = await db.execute(asset_query, {"asset_id": asset_id})
            asset_row = asset_result.fetchone()

            if not asset_row:
                return {"success": False, "message": "Asset not found"}

            asset_data = {
                "created_at": asset_row.created_at,
                "battery_cycles": asset_row.battery_cycles or 0,
                "last_maintenance_date": asset_row.last_maintenance_date,
                "maintenance_frequency": 2,  # Default
            }

            # Get historical data
            historical_data = await self._get_asset_historical_data(asset_id)

            # Make prediction
            prediction = self.maintenance_predictor.predict(asset_data, historical_data)

            return {
                "success": True,
                "asset_id": asset_id,
                "prediction": prediction,
                "model_version": "v1.0",
                "last_trained": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error predicting maintenance: {e}")
            return {"success": False, "error": str(e)}

    async def get_model_status(self) -> Dict[str, Any]:
        """Get status of all models"""
        return {
            "location_predictor": {
                "trained": self.location_predictor.is_trained,
                "model_path": os.path.join(
                    self.model_path, "location_predictor.joblib"
                ),
            },
            "maintenance_predictor": {
                "trained": self.maintenance_predictor.is_trained,
                "model_path": os.path.join(
                    self.model_path, "maintenance_predictor.joblib"
                ),
            },
            "models_loaded": self.models_loaded,
        }


# Global model server instance
model_server = ModelServer()
