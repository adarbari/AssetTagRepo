"""
Unit tests for ML models
"""
import pytest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from ml.models.location_predictor import LocationPredictor
from ml.models.maintenance_predictor import MaintenancePredictor


class TestLocationPredictor:
    """Test LocationPredictor functionality"""
    
    def test_model_initialization(self):
        """Test model initialization"""
        predictor = LocationPredictor()
        
        assert predictor.model is None
        assert predictor.scaler is not None
        assert predictor.is_trained is False
        assert len(predictor.feature_columns) > 0
        assert len(predictor.target_columns) > 0
    
    def test_prepare_features(self):
        """Test feature preparation"""
        predictor = LocationPredictor()
        
        # Test with empty data
        features = predictor.prepare_features([])
        assert features.empty
        
        # Test with sample data
        historical_data = [
            {
                "estimated_at": "2024-01-01T12:00:00Z",
                "latitude": 40.7128,
                "longitude": -74.0060,
                "rssi": -65,
                "gateway_ids": ["gw1", "gw2"],
                "distance_from_previous": 100.0,
                "battery_level": 80,
                "temperature": 25.0
            },
            {
                "estimated_at": "2024-01-01T12:01:00Z",
                "latitude": 40.7130,
                "longitude": -74.0058,
                "rssi": -70,
                "gateway_ids": ["gw1", "gw3"],
                "distance_from_previous": 50.0,
                "battery_level": 79,
                "temperature": 25.5
            }
        ]
        
        features = predictor.prepare_features(historical_data)
        
        assert not features.empty
        assert len(features) == 2
        assert all(col in features.columns for col in predictor.feature_columns)
    
    def test_train_model(self):
        """Test model training"""
        predictor = LocationPredictor()
        
        # Create training data
        training_data = []
        for i in range(50):  # Need sufficient data for training
            training_data.append({
                "estimated_at": f"2024-01-01T{12 + i//60:02d}:{i%60:02d}:00Z",
                "latitude": 40.7128 + (i * 0.0001),
                "longitude": -74.0060 + (i * 0.0001),
                "rssi": -65 - (i % 20),
                "gateway_ids": ["gw1", "gw2"],
                "distance_from_previous": 10.0 + (i % 50),
                "battery_level": 80 - (i % 20),
                "temperature": 25.0 + (i % 10)
            })
        
        metrics = predictor.train(training_data)
        
        assert predictor.is_trained is True
        assert "latitude_mse" in metrics
        assert "longitude_mse" in metrics
        assert "latitude_r2" in metrics
        assert "longitude_r2" in metrics
        assert "training_samples" in metrics
        assert metrics["training_samples"] == 50
    
    def test_predict_locations(self):
        """Test location prediction"""
        predictor = LocationPredictor()
        
        # Train model first
        training_data = []
        for i in range(50):
            training_data.append({
                "estimated_at": f"2024-01-01T{12 + i//60:02d}:{i%60:02d}:00Z",
                "latitude": 40.7128 + (i * 0.0001),
                "longitude": -74.0060 + (i * 0.0001),
                "rssi": -65 - (i % 20),
                "gateway_ids": ["gw1", "gw2"],
                "distance_from_previous": 10.0 + (i % 50),
                "battery_level": 80 - (i % 20),
                "temperature": 25.0 + (i % 10)
            })
        
        predictor.train(training_data)
        
        # Prepare features for prediction
        features = predictor.prepare_features(training_data[-10:])  # Use last 10 records
        
        # Make predictions
        predictions = predictor.predict(features, steps_ahead=3)
        
        assert len(predictions) == 3
        for pred in predictions:
            assert "latitude" in pred
            assert "longitude" in pred
            assert "confidence" in pred
            assert "step" in pred
            assert 0 <= pred["confidence"] <= 1
            assert 1 <= pred["step"] <= 3
    
    def test_predict_without_training(self):
        """Test prediction without training"""
        predictor = LocationPredictor()
        
        features = pd.DataFrame(columns=predictor.feature_columns)
        
        with pytest.raises(ValueError, match="Model not trained"):
            predictor.predict(features)
    
    def test_save_load_model(self, tmp_path):
        """Test model saving and loading"""
        predictor = LocationPredictor()
        
        # Train model first
        training_data = []
        for i in range(50):
            training_data.append({
                "estimated_at": f"2024-01-01T{12 + i//60:02d}:{i%60:02d}:00Z",
                "latitude": 40.7128 + (i * 0.0001),
                "longitude": -74.0060 + (i * 0.0001),
                "rssi": -65 - (i % 20),
                "gateway_ids": ["gw1", "gw2"],
                "distance_from_previous": 10.0 + (i % 50),
                "battery_level": 80 - (i % 20),
                "temperature": 25.0 + (i % 10)
            })
        
        predictor.train(training_data)
        
        # Save model
        model_path = tmp_path / "test_model.joblib"
        predictor.save_model(str(model_path))
        
        # Create new predictor and load model
        new_predictor = LocationPredictor()
        new_predictor.load_model(str(model_path))
        
        assert new_predictor.is_trained is True
        assert new_predictor.feature_columns == predictor.feature_columns
        assert new_predictor.target_columns == predictor.target_columns


class TestMaintenancePredictor:
    """Test MaintenancePredictor functionality"""
    
    def test_model_initialization(self):
        """Test model initialization"""
        predictor = MaintenancePredictor()
        
        assert predictor.model is None
        assert predictor.scaler is not None
        assert predictor.label_encoder is not None
        assert predictor.is_trained is False
        assert len(predictor.feature_columns) > 0
        assert len(predictor.maintenance_types) > 0
    
    def test_prepare_features(self):
        """Test feature preparation"""
        predictor = MaintenancePredictor()
        
        asset_data = {
            "created_at": datetime.now() - timedelta(days=365),
            "battery_cycles": 500,
            "last_maintenance_date": datetime.now() - timedelta(days=30),
            "maintenance_frequency": 2
        }
        
        historical_data = [
            {
                "estimated_at": "2024-01-01T12:00:00Z",
                "hours_active": 8.0,
                "total_distance": 100.0,
                "temperature": 25.0,
                "vibration": 0.5,
                "error_count": 0
            },
            {
                "estimated_at": "2024-01-02T12:00:00Z",
                "hours_active": 7.5,
                "total_distance": 95.0,
                "temperature": 26.0,
                "vibration": 0.6,
                "error_count": 1
            }
        ]
        
        features = predictor.prepare_features(asset_data, historical_data)
        
        assert not features.empty
        assert len(features) == 1
        assert all(col in features.columns for col in predictor.feature_columns)
        assert features.iloc[0]["utilization_hours"] == 15.5  # 8.0 + 7.5
        assert features.iloc[0]["total_distance"] == 195.0  # 100.0 + 95.0
    
    def test_train_model(self):
        """Test model training"""
        predictor = MaintenancePredictor()
        
        # Create training data
        training_data = []
        for i in range(30):  # Need sufficient data for training
            asset_data = {
                "created_at": datetime.now() - timedelta(days=365),
                "battery_cycles": 500 + (i * 10),
                "last_maintenance_date": datetime.now() - timedelta(days=30 + i),
                "maintenance_frequency": 2
            }
            
            historical_data = [
                {
                    "estimated_at": f"2024-01-01T{12 + i//60:02d}:{i%60:02d}:00Z",
                    "hours_active": 8.0 + (i % 5),
                    "total_distance": 100.0 + (i * 10),
                    "temperature": 25.0 + (i % 10),
                    "vibration": 0.5 + (i % 3) * 0.1,
                    "error_count": i % 5
                }
            ]
            
            maintenance_type = ["scheduled", "preventive", "corrective"][i % 3]
            
            training_data.append({
                "asset_data": asset_data,
                "historical_data": historical_data,
                "maintenance_type": maintenance_type
            })
        
        metrics = predictor.train(training_data)
        
        assert predictor.is_trained is True
        assert "accuracy" in metrics
        assert "training_samples" in metrics
        assert "feature_importance" in metrics
        assert metrics["training_samples"] == 30
        assert 0 <= metrics["accuracy"] <= 1
    
    def test_predict_maintenance(self):
        """Test maintenance prediction"""
        predictor = MaintenancePredictor()
        
        # Train model first
        training_data = []
        for i in range(30):
            asset_data = {
                "created_at": datetime.now() - timedelta(days=365),
                "battery_cycles": 500 + (i * 10),
                "last_maintenance_date": datetime.now() - timedelta(days=30 + i),
                "maintenance_frequency": 2
            }
            
            historical_data = [
                {
                    "estimated_at": f"2024-01-01T{12 + i//60:02d}:{i%60:02d}:00Z",
                    "hours_active": 8.0 + (i % 5),
                    "total_distance": 100.0 + (i * 10),
                    "temperature": 25.0 + (i % 10),
                    "vibration": 0.5 + (i % 3) * 0.1,
                    "error_count": i % 5
                }
            ]
            
            maintenance_type = ["scheduled", "preventive", "corrective"][i % 3]
            
            training_data.append({
                "asset_data": asset_data,
                "historical_data": historical_data,
                "maintenance_type": maintenance_type
            })
        
        predictor.train(training_data)
        
        # Test prediction
        asset_data = {
            "created_at": datetime.now() - timedelta(days=200),
            "battery_cycles": 800,
            "last_maintenance_date": datetime.now() - timedelta(days=60),
            "maintenance_frequency": 3
        }
        
        historical_data = [
            {
                "estimated_at": "2024-01-01T12:00:00Z",
                "hours_active": 10.0,
                "total_distance": 200.0,
                "temperature": 30.0,
                "vibration": 0.8,
                "error_count": 3
            }
        ]
        
        prediction = predictor.predict(asset_data, historical_data)
        
        assert "maintenance_type" in prediction
        assert "confidence" in prediction
        assert "urgency" in prediction
        assert "predicted_date" in prediction
        assert "feature_analysis" in prediction
        assert 0 <= prediction["confidence"] <= 1
        assert prediction["urgency"] in ["low", "medium", "high"]
    
    def test_predict_without_training(self):
        """Test prediction without training"""
        predictor = MaintenancePredictor()
        
        asset_data = {}
        historical_data = []
        
        with pytest.raises(ValueError, match="Model not trained"):
            predictor.predict(asset_data, historical_data)
    
    def test_urgency_determination(self):
        """Test urgency determination logic"""
        predictor = MaintenancePredictor()
        
        # Test high urgency
        features_high = pd.Series({
            "error_count": 10,
            "temperature_max": 45,
            "days_since_maintenance": 100,
            "battery_cycles": 500
        })
        
        urgency = predictor._determine_urgency(features_high)
        assert urgency == "high"
        
        # Test medium urgency
        features_medium = pd.Series({
            "error_count": 2,
            "temperature_max": 35,
            "days_since_maintenance": 200,
            "battery_cycles": 1000
        })
        
        urgency = predictor._determine_urgency(features_medium)
        assert urgency == "medium"
        
        # Test low urgency
        features_low = pd.Series({
            "error_count": 1,
            "temperature_max": 30,
            "days_since_maintenance": 50,
            "battery_cycles": 200
        })
        
        urgency = predictor._determine_urgency(features_low)
        assert urgency == "low"
    
    def test_save_load_model(self, tmp_path):
        """Test model saving and loading"""
        predictor = MaintenancePredictor()
        
        # Train model first
        training_data = []
        for i in range(30):
            asset_data = {
                "created_at": datetime.now() - timedelta(days=365),
                "battery_cycles": 500 + (i * 10),
                "last_maintenance_date": datetime.now() - timedelta(days=30 + i),
                "maintenance_frequency": 2
            }
            
            historical_data = [
                {
                    "estimated_at": f"2024-01-01T{12 + i//60:02d}:{i%60:02d}:00Z",
                    "hours_active": 8.0 + (i % 5),
                    "total_distance": 100.0 + (i * 10),
                    "temperature": 25.0 + (i % 10),
                    "vibration": 0.5 + (i % 3) * 0.1,
                    "error_count": i % 5
                }
            ]
            
            maintenance_type = ["scheduled", "preventive", "corrective"][i % 3]
            
            training_data.append({
                "asset_data": asset_data,
                "historical_data": historical_data,
                "maintenance_type": maintenance_type
            })
        
        predictor.train(training_data)
        
        # Save model
        model_path = tmp_path / "test_maintenance_model.joblib"
        predictor.save_model(str(model_path))
        
        # Create new predictor and load model
        new_predictor = MaintenancePredictor()
        new_predictor.load_model(str(model_path))
        
        assert new_predictor.is_trained is True
        assert new_predictor.feature_columns == predictor.feature_columns
        assert new_predictor.maintenance_types == predictor.maintenance_types
