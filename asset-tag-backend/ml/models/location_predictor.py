"""
Location Prediction ML Model
"""

import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)


class LocationPredictor:
    """ML model for predicting asset locations"""

    def __init__(self) -> None:
        self.model = None
        self.scaler = StandardScaler()
        self.is_trained = False
        self.feature_columns = [
            "hour_of_day",
            "day_of_week",
            "month",
            "rssi_avg",
            "rssi_std",
            "gateway_count",
            "distance_from_previous",
            "time_since_last_update",
            "battery_level",
            "temperature",
            "movement_speed",
        ]
        self.target_columns = ["latitude", "longitude"]

    def prepare_features(self, historical_data: List[Dict]) -> pd.DataFrame:
        """Prepare features from historical location data"""
        try:
            df = pd.DataFrame(historical_data)

            if df.empty:
                return pd.DataFrame(columns=self.feature_columns)

            # Convert timestamps
            df["timestamp"] = pd.to_datetime(df["estimated_at"])
            df["hour_of_day"] = df["timestamp"].dt.hour
            df["day_of_week"] = df["timestamp"].dt.dayofweek
            df["month"] = df["timestamp"].dt.month

            # Calculate RSSI statistics
            df["rssi_avg"] = df["rssi"].rolling(window=5, min_periods=1).mean()
            df["rssi_std"] = df["rssi"].rolling(window=5, min_periods=1).std()

            # Gateway count
            df["gateway_count"] = df["gateway_ids"].apply(lambda x: len(x) if x else 0)

            # Distance and movement features
            df["distance_from_previous"] = df["distance_from_previous"].fillna(0)
            df["time_since_last_update"] = (
                df["timestamp"].diff().dt.total_seconds().fillna(0)
            )
            df["movement_speed"] = df["distance_from_previous"] / (
                df["time_since_last_update"] + 1
            )

            # Fill missing values
            df["battery_level"] = df["battery_level"].fillna(50)
            df["temperature"] = df["temperature"].fillna(20)

            # Select feature columns
            features = df[self.feature_columns].fillna(0)

            return features

        except Exception as e:
            logger.error(f"Error preparing features: {e}")
            return pd.DataFrame(columns=self.feature_columns)

    def train(self, training_data: List[Dict]) -> Dict[str, float]:
        """Train the location prediction model"""
        try:
            if not training_data:
                raise ValueError("No training data provided")

            # Prepare features and targets
            df = pd.DataFrame(training_data)
            features = self.prepare_features(training_data)

            if features.empty:
                raise ValueError("No valid features extracted from training data")

            # Prepare targets
            targets = df[self.target_columns].fillna(0)

            # Scale features
            features_scaled = self.scaler.fit_transform(features)

            # Train separate models for latitude and longitude
            self.lat_model = RandomForestRegressor(n_estimators=100, random_state=42)
            self.lng_model = RandomForestRegressor(n_estimators=100, random_state=42)

            self.lat_model.fit(features_scaled, targets["latitude"])
            self.lng_model.fit(features_scaled, targets["longitude"])

            # Calculate training metrics
            lat_pred = self.lat_model.predict(features_scaled)
            lng_pred = self.lng_model.predict(features_scaled)

            lat_mse = mean_squared_error(targets["latitude"], lat_pred)
            lng_mse = mean_squared_error(targets["longitude"], lng_pred)
            lat_r2 = r2_score(targets["latitude"], lat_pred)
            lng_r2 = r2_score(targets["longitude"], lng_pred)

            self.is_trained = True

            return {
                "latitude_mse": lat_mse,
                "longitude_mse": lng_mse,
                "latitude_r2": lat_r2,
                "longitude_r2": lng_r2,
                "training_samples": len(training_data),
            }

        except Exception as e:
            logger.error(f"Error training location predictor: {e}")
            raise

    def predict(self, features: pd.DataFrame, steps_ahead: int = 1) -> List[Dict]:
        """Predict future locations"""
        try:
            if not self.is_trained:
                raise ValueError("Model not trained")

            if features.empty:
                return []

            # Scale features
            features_scaled = self.scaler.transform(features)

            predictions = []
            current_features = features_scaled[-1:]  # Use last known features

            for step in range(steps_ahead):
                # Predict next location
                lat_pred = self.lat_model.predict(current_features)[0]
                lng_pred = self.lng_model.predict(current_features)[0]

                # Calculate confidence based on feature variance
                lat_confidence = max(
                    0.1, 1.0 - abs(lat_pred - current_features[0][0]) * 0.01
                )
                lng_confidence = max(
                    0.1, 1.0 - abs(lng_pred - current_features[0][1]) * 0.01
                )
                confidence = (lat_confidence + lng_confidence) / 2

                predictions.append(
                    {
                        "latitude": float(lat_pred),
                        "longitude": float(lng_pred),
                        "confidence": float(confidence),
                        "step": step + 1,
                    }
                )

                # Update features for next prediction (simplified)
                current_features[0][0] = lat_pred  # Update hour (simplified)
                current_features[0][1] = lng_pred  # Update day (simplified)

            return predictions

        except Exception as e:
            logger.error(f"Error predicting locations: {e}")
            raise

    def save_model(self, filepath: str) -> None:
        """Save the trained model"""
        try:
            if not self.is_trained:
                raise ValueError("Model not trained")

            model_data = {
                "lat_model": self.lat_model,
                "lng_model": self.lng_model,
                "scaler": self.scaler,
                "feature_columns": self.feature_columns,
                "target_columns": self.target_columns,
                "is_trained": self.is_trained,
            }

            joblib.dump(model_data, filepath)
            logger.info(f"Model saved to {filepath}")

        except Exception as e:
            logger.error(f"Error saving model: {e}")
            raise

    def load_model(self, filepath: str) -> None:
        """Load a trained model"""
        try:
            model_data = joblib.load(filepath)

            self.lat_model = model_data["lat_model"]
            self.lng_model = model_data["lng_model"]
            self.scaler = model_data["scaler"]
            self.feature_columns = model_data["feature_columns"]
            self.target_columns = model_data["target_columns"]
            self.is_trained = model_data["is_trained"]

            logger.info(f"Model loaded from {filepath}")

        except Exception as e:
            logger.error(f"Error loading model: {e}")
            raise
