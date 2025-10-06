"""
ML model inference engine
"""
import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Union

import numpy as np

from config.cache import get_cache
from ml.features.feature_store import (
    AssetBaseline,
    FeatureStore,
    FeatureVector,
    get_feature_store,
)
from ml.serving.model_loader import ModelLoader, get_model_loader

logger = logging.getLogger(__name__)


class InferenceEngine:
    """ML model inference engine"""

    def __init__(self):
        self.model_loader = None
        self.feature_store = None
        self.cache = None

    async def _get_model_loader(self) -> ModelLoader:
        """Get model loader"""
        if not self.model_loader:
            self.model_loader = await get_model_loader()
        return self.model_loader

    async def _get_feature_store(self) -> FeatureStore:
        """Get feature store"""
        if not self.feature_store:
            self.feature_store = await get_feature_store()
        return self.feature_store

    async def _get_cache(self):
        """Get cache manager"""
        if not self.cache:
            self.cache = await get_cache()
        return self.cache

    async def predict_anomaly(self, asset_id: str) -> Dict[str, Any]:
        """Predict anomaly for an asset"""
        try:
            # Get features and baseline
            feature_store = await self._get_feature_store()
            features = await feature_store.get_features(asset_id)
            baseline = await feature_store.get_baseline(asset_id)

            if not features:
                return {
                    "asset_id": asset_id,
                    "anomaly_score": 0.5,
                    "is_anomalous": False,
                    "confidence": 0.0,
                    "error": "No features available",
                }

            # Try to get cached prediction first
            cache = await self._get_cache()
            cached_prediction = await cache.get_with_strategy(
                "ml_predictions", asset_id=asset_id
            )

            if cached_prediction and "anomaly_score" in cached_prediction:
                return cached_prediction

            # Load model
            model_loader = await self._get_model_loader()
            model = await model_loader.get_model("anomaly_detector", "sklearn")

            if not model:
                # Fallback to rule-based anomaly detection
                return await self._rule_based_anomaly_detection(features, baseline)

            # Prepare features for model
            feature_vector = self._prepare_feature_vector(features, baseline)

            if feature_vector is None:
                return await self._rule_based_anomaly_detection(features, baseline)

            # Make prediction
            anomaly_score = model.predict_proba([feature_vector])[0][
                1
            ]  # Probability of anomaly

            # Calculate confidence based on feature quality
            confidence = self._calculate_prediction_confidence(features, baseline)

            result = {
                "asset_id": asset_id,
                "anomaly_score": float(anomaly_score),
                "is_anomalous": anomaly_score > 0.7,
                "confidence": confidence,
                "timestamp": datetime.now().isoformat(),
                "model_type": "ml_model",
                "features_used": len(feature_vector),
                "baseline_available": baseline is not None,
            }

            # Cache prediction for 1 minute
            await cache.set_with_strategy("ml_predictions", result, asset_id=asset_id)

            return result

        except Exception as e:
            logger.error(f"Error predicting anomaly for {asset_id}: {e}")
            return {
                "asset_id": asset_id,
                "anomaly_score": 0.5,
                "is_anomalous": False,
                "confidence": 0.0,
                "error": str(e),
            }

    async def predict_location(
        self, asset_id: str, future_minutes: int = 30
    ) -> Dict[str, Any]:
        """Predict future location for an asset"""
        try:
            # Get current features
            feature_store = await self._get_feature_store()
            features = await feature_store.get_features(asset_id)

            if not features or "current_speed" not in features.features:
                return {
                    "asset_id": asset_id,
                    "predicted_location": None,
                    "confidence": 0.0,
                    "error": "Insufficient location data",
                }

            # Load model
            model_loader = await self._get_model_loader()
            model = await model_loader.get_model("location_predictor", "sklearn")

            if not model:
                # Fallback to simple linear prediction
                return await self._simple_location_prediction(features, future_minutes)

            # Prepare features for model
            feature_vector = self._prepare_location_features(features)

            if feature_vector is None:
                return await self._simple_location_prediction(features, future_minutes)

            # Make prediction
            prediction = model.predict([feature_vector])[0]

            result = {
                "asset_id": asset_id,
                "predicted_location": {
                    "latitude": float(prediction[0]),
                    "longitude": float(prediction[1]),
                    "confidence": float(prediction[2]) if len(prediction) > 2 else 0.8,
                },
                "prediction_time": future_minutes,
                "timestamp": datetime.now().isoformat(),
                "model_type": "ml_model",
            }

            return result

        except Exception as e:
            logger.error(f"Error predicting location for {asset_id}: {e}")
            return {
                "asset_id": asset_id,
                "predicted_location": None,
                "confidence": 0.0,
                "error": str(e),
            }

    async def predict_battery_degradation(
        self, asset_id: str, days_ahead: int = 7
    ) -> Dict[str, Any]:
        """Predict battery degradation for an asset"""
        try:
            # Get current features
            feature_store = await self._get_feature_store()
            features = await feature_store.get_features(asset_id)
            baseline = await feature_store.get_baseline(asset_id)

            if not features or "avg_battery" not in features.features:
                return {
                    "asset_id": asset_id,
                    "predicted_battery": None,
                    "confidence": 0.0,
                    "error": "No battery data available",
                }

            # Load model
            model_loader = await self._get_model_loader()
            model = await model_loader.get_model("battery_predictor", "sklearn")

            if not model:
                # Fallback to linear degradation
                return await self._linear_battery_prediction(
                    features, baseline, days_ahead
                )

            # Prepare features for model
            feature_vector = self._prepare_battery_features(features, baseline)

            if feature_vector is None:
                return await self._linear_battery_prediction(
                    features, baseline, days_ahead
                )

            # Make prediction
            predicted_battery = model.predict([feature_vector])[0]

            result = {
                "asset_id": asset_id,
                "current_battery": features.features["avg_battery"],
                "predicted_battery": float(predicted_battery),
                "degradation_rate": float(
                    features.features["avg_battery"] - predicted_battery
                )
                / days_ahead,
                "days_ahead": days_ahead,
                "timestamp": datetime.now().isoformat(),
                "model_type": "ml_model",
            }

            return result

        except Exception as e:
            logger.error(f"Error predicting battery degradation for {asset_id}: {e}")
            return {
                "asset_id": asset_id,
                "predicted_battery": None,
                "confidence": 0.0,
                "error": str(e),
            }

    def _prepare_feature_vector(
        self, features: FeatureVector, baseline: Optional[AssetBaseline]
    ) -> Optional[List[float]]:
        """Prepare feature vector for anomaly detection model"""
        try:
            feature_vector = []

            # Basic features
            feature_vector.extend(
                [
                    features.features.get("avg_rssi", 0.0),
                    features.features.get("min_rssi", 0.0),
                    features.features.get("max_rssi", 0.0),
                    features.features.get("rssi_std", 0.0),
                    features.features.get("avg_battery", 0.0),
                    features.features.get("avg_temperature", 0.0),
                    features.features.get("gateway_count", 0.0),
                    features.features.get("current_confidence", 0.0),
                    features.features.get("current_speed", 0.0),
                    features.features.get("hour_of_day", 0.0),
                    features.features.get("day_of_week", 0.0),
                    features.features.get("is_weekend", 0.0),
                ]
            )

            # Baseline comparison features
            if baseline:
                feature_vector.extend(
                    [
                        baseline.avg_temperature,
                        baseline.typical_confidence,
                        baseline.normal_battery_drain_rate,
                    ]
                )
            else:
                feature_vector.extend([0.0, 0.0, 0.0])

            return feature_vector

        except Exception as e:
            logger.error(f"Error preparing feature vector: {e}")
            return None

    def _prepare_location_features(
        self, features: FeatureVector
    ) -> Optional[List[float]]:
        """Prepare features for location prediction"""
        try:
            return [
                features.features.get("current_speed", 0.0),
                features.features.get("current_bearing", 0.0),
                features.features.get("current_confidence", 0.0),
                features.features.get("avg_rssi", 0.0),
                features.features.get("gateway_count", 0.0),
                features.features.get("hour_of_day", 0.0),
                features.features.get("day_of_week", 0.0),
            ]
        except Exception as e:
            logger.error(f"Error preparing location features: {e}")
            return None

    def _prepare_battery_features(
        self, features: FeatureVector, baseline: Optional[AssetBaseline]
    ) -> Optional[List[float]]:
        """Prepare features for battery prediction"""
        try:
            feature_vector = [
                features.features.get("avg_battery", 0.0),
                features.features.get("avg_temperature", 0.0),
                features.features.get("hour_of_day", 0.0),
                features.features.get("day_of_week", 0.0),
            ]

            if baseline:
                feature_vector.append(baseline.normal_battery_drain_rate)
            else:
                feature_vector.append(0.1)  # Default drain rate

            return feature_vector

        except Exception as e:
            logger.error(f"Error preparing battery features: {e}")
            return None

    def _calculate_prediction_confidence(
        self, features: FeatureVector, baseline: Optional[AssetBaseline]
    ) -> float:
        """Calculate confidence in prediction based on data quality"""
        try:
            confidence = 0.5  # Base confidence

            # More features = higher confidence
            feature_count = len(features.features)
            confidence += min(feature_count / 20.0, 0.3)

            # Baseline available = higher confidence
            if baseline:
                confidence += 0.2

            # Recent data = higher confidence
            time_since_update = (datetime.now() - features.timestamp).total_seconds()
            if time_since_update < 300:  # 5 minutes
                confidence += 0.2
            elif time_since_update < 1800:  # 30 minutes
                confidence += 0.1

            return min(confidence, 1.0)

        except Exception as e:
            logger.error(f"Error calculating confidence: {e}")
            return 0.5

    async def _rule_based_anomaly_detection(
        self, features: FeatureVector, baseline: Optional[AssetBaseline]
    ) -> Dict[str, Any]:
        """Fallback rule-based anomaly detection"""
        try:
            anomaly_score = 0.0

            # Battery anomaly
            if "avg_battery" in features.features:
                battery = features.features["avg_battery"]
                if battery < 20:
                    anomaly_score += 0.4
                elif battery < 10:
                    anomaly_score += 0.6

            # Temperature anomaly
            if "avg_temperature" in features.features:
                temp = features.features["avg_temperature"]
                if temp > 50 or temp < -10:
                    anomaly_score += 0.3

            # RSSI anomaly
            if "avg_rssi" in features.features:
                rssi = features.features["avg_rssi"]
                if rssi < -80:  # Very weak signal
                    anomaly_score += 0.3

            # Confidence anomaly
            if "current_confidence" in features.features:
                confidence = features.features["current_confidence"]
                if confidence < 0.3:
                    anomaly_score += 0.2

            return {
                "asset_id": features.asset_id,
                "anomaly_score": min(anomaly_score, 1.0),
                "is_anomalous": anomaly_score > 0.5,
                "confidence": 0.6,  # Lower confidence for rule-based
                "timestamp": datetime.now().isoformat(),
                "model_type": "rule_based",
            }

        except Exception as e:
            logger.error(f"Error in rule-based anomaly detection: {e}")
            return {
                "asset_id": features.asset_id,
                "anomaly_score": 0.5,
                "is_anomalous": False,
                "confidence": 0.0,
                "error": str(e),
            }

    async def _simple_location_prediction(
        self, features: FeatureVector, future_minutes: int
    ) -> Dict[str, Any]:
        """Simple linear location prediction"""
        try:
            # This is a placeholder - would need actual location data
            return {
                "asset_id": features.asset_id,
                "predicted_location": None,
                "confidence": 0.3,
                "error": "Insufficient location data for prediction",
                "model_type": "simple_linear",
            }

        except Exception as e:
            logger.error(f"Error in simple location prediction: {e}")
            return {
                "asset_id": features.asset_id,
                "predicted_location": None,
                "confidence": 0.0,
                "error": str(e),
            }

    async def _linear_battery_prediction(
        self,
        features: FeatureVector,
        baseline: Optional[AssetBaseline],
        days_ahead: int,
    ) -> Dict[str, Any]:
        """Linear battery degradation prediction"""
        try:
            current_battery = features.features.get("avg_battery", 50.0)

            # Use baseline drain rate or default
            if baseline:
                drain_rate = baseline.normal_battery_drain_rate
            else:
                drain_rate = 0.1  # 10% per day default

            predicted_battery = max(0, current_battery - (drain_rate * days_ahead))

            return {
                "asset_id": features.asset_id,
                "current_battery": current_battery,
                "predicted_battery": predicted_battery,
                "degradation_rate": drain_rate,
                "days_ahead": days_ahead,
                "timestamp": datetime.now().isoformat(),
                "model_type": "linear",
            }

        except Exception as e:
            logger.error(f"Error in linear battery prediction: {e}")
            return {
                "asset_id": features.asset_id,
                "predicted_battery": None,
                "confidence": 0.0,
                "error": str(e),
            }


# Global inference engine instance
inference_engine = InferenceEngine()


async def get_inference_engine() -> InferenceEngine:
    """Get inference engine instance"""
    return inference_engine
