"""
Predictive Maintenance ML Model
"""
import logging
import numpy as np
import pandas as pd
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score

logger = logging.getLogger(__name__)


class MaintenancePredictor:
    """ML model for predicting maintenance needs"""
    
    def __init__(self):
        self.model = None
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.is_trained = False
        self.feature_columns = [
            'utilization_hours', 'total_distance', 'battery_cycles', 'temperature_avg',
            'temperature_max', 'vibration_avg', 'error_count', 'days_since_maintenance',
            'maintenance_frequency', 'age_days', 'usage_intensity'
        ]
        self.maintenance_types = ['scheduled', 'preventive', 'corrective', 'emergency']
    
    def prepare_features(self, asset_data: Dict, historical_data: List[Dict]) -> pd.DataFrame:
        """Prepare features from asset and historical data"""
        try:
            # Calculate utilization metrics
            utilization_hours = sum([d.get('hours_active', 0) for d in historical_data])
            total_distance = sum([d.get('total_distance', 0) for d in historical_data])
            
            # Calculate battery cycles (simplified)
            battery_cycles = asset_data.get('battery_cycles', 0)
            
            # Temperature statistics
            temperatures = [d.get('temperature', 20) for d in historical_data if d.get('temperature')]
            temperature_avg = np.mean(temperatures) if temperatures else 20
            temperature_max = np.max(temperatures) if temperatures else 20
            
            # Vibration (simplified - would come from sensors)
            vibration_avg = np.mean([d.get('vibration', 0) for d in historical_data])
            
            # Error count
            error_count = sum([d.get('error_count', 0) for d in historical_data])
            
            # Days since last maintenance
            last_maintenance = asset_data.get('last_maintenance_date')
            if last_maintenance:
                days_since_maintenance = (datetime.now() - last_maintenance).days
            else:
                days_since_maintenance = 365  # Default to 1 year
            
            # Maintenance frequency (maintenances per year)
            maintenance_frequency = asset_data.get('maintenance_frequency', 2)
            
            # Asset age
            created_date = asset_data.get('created_at', datetime.now() - timedelta(days=365))
            age_days = (datetime.now() - created_date).days
            
            # Usage intensity (utilization / age)
            usage_intensity = utilization_hours / max(age_days, 1)
            
            features = pd.DataFrame([{
                'utilization_hours': utilization_hours,
                'total_distance': total_distance,
                'battery_cycles': battery_cycles,
                'temperature_avg': temperature_avg,
                'temperature_max': temperature_max,
                'vibration_avg': vibration_avg,
                'error_count': error_count,
                'days_since_maintenance': days_since_maintenance,
                'maintenance_frequency': maintenance_frequency,
                'age_days': age_days,
                'usage_intensity': usage_intensity
            }])
            
            return features
            
        except Exception as e:
            logger.error(f"Error preparing maintenance features: {e}")
            return pd.DataFrame(columns=self.feature_columns)
    
    def train(self, training_data: List[Dict]) -> Dict[str, float]:
        """Train the maintenance prediction model"""
        try:
            if not training_data:
                raise ValueError("No training data provided")
            
            # Prepare features and targets
            features_list = []
            targets_list = []
            
            for record in training_data:
                asset_data = record.get('asset_data', {})
                historical_data = record.get('historical_data', [])
                maintenance_type = record.get('maintenance_type', 'scheduled')
                
                features = self.prepare_features(asset_data, historical_data)
                if not features.empty:
                    features_list.append(features.iloc[0])
                    targets_list.append(maintenance_type)
            
            if not features_list:
                raise ValueError("No valid features extracted from training data")
            
            # Convert to DataFrame
            features_df = pd.DataFrame(features_list)
            targets_df = pd.Series(targets_list)
            
            # Encode target labels
            targets_encoded = self.label_encoder.fit_transform(targets_df)
            
            # Scale features
            features_scaled = self.scaler.fit_transform(features_df)
            
            # Train model
            self.model = RandomForestClassifier(n_estimators=100, random_state=42)
            self.model.fit(features_scaled, targets_encoded)
            
            # Calculate training metrics
            predictions = self.model.predict(features_scaled)
            accuracy = accuracy_score(targets_encoded, predictions)
            
            self.is_trained = True
            
            return {
                'accuracy': accuracy,
                'training_samples': len(training_data),
                'feature_importance': dict(zip(
                    self.feature_columns,
                    self.model.feature_importances_
                ))
            }
            
        except Exception as e:
            logger.error(f"Error training maintenance predictor: {e}")
            raise
    
    def predict(self, asset_data: Dict, historical_data: List[Dict]) -> Dict:
        """Predict maintenance needs for an asset"""
        try:
            if not self.is_trained:
                raise ValueError("Model not trained")
            
            features = self.prepare_features(asset_data, historical_data)
            if features.empty:
                return {
                    'maintenance_type': 'scheduled',
                    'confidence': 0.5,
                    'urgency': 'low',
                    'predicted_date': (datetime.now() + timedelta(days=30)).isoformat()
                }
            
            # Scale features
            features_scaled = self.scaler.transform(features)
            
            # Predict maintenance type
            prediction = self.model.predict(features_scaled)[0]
            prediction_proba = self.model.predict_proba(features_scaled)[0]
            
            maintenance_type = self.label_encoder.inverse_transform([prediction])[0]
            confidence = float(np.max(prediction_proba))
            
            # Determine urgency based on features
            urgency = self._determine_urgency(features.iloc[0])
            
            # Predict maintenance date
            predicted_date = self._predict_maintenance_date(features.iloc[0], maintenance_type)
            
            return {
                'maintenance_type': maintenance_type,
                'confidence': confidence,
                'urgency': urgency,
                'predicted_date': predicted_date.isoformat(),
                'feature_analysis': self._analyze_features(features.iloc[0])
            }
            
        except Exception as e:
            logger.error(f"Error predicting maintenance: {e}")
            return {
                'maintenance_type': 'scheduled',
                'confidence': 0.5,
                'urgency': 'low',
                'predicted_date': (datetime.now() + timedelta(days=30)).isoformat()
            }
    
    def _determine_urgency(self, features: pd.Series) -> str:
        """Determine maintenance urgency based on features"""
        if features['error_count'] > 5 or features['temperature_max'] > 40:
            return 'high'
        elif features['days_since_maintenance'] > 180 or features['battery_cycles'] > 1000:
            return 'medium'
        else:
            return 'low'
    
    def _predict_maintenance_date(self, features: pd.Series, maintenance_type: str) -> datetime:
        """Predict when maintenance will be needed"""
        base_days = {
            'emergency': 1,
            'corrective': 7,
            'preventive': 30,
            'scheduled': 90
        }
        
        base_days = base_days.get(maintenance_type, 30)
        
        # Adjust based on urgency factors
        if features['days_since_maintenance'] > 200:
            base_days = max(1, base_days - 15)
        if features['error_count'] > 3:
            base_days = max(1, base_days - 10)
        if features['temperature_max'] > 35:
            base_days = max(1, base_days - 5)
        
        return datetime.now() + timedelta(days=base_days)
    
    def _analyze_features(self, features: pd.Series) -> Dict:
        """Analyze features to provide insights"""
        analysis = {}
        
        if features['utilization_hours'] > 2000:
            analysis['high_utilization'] = True
        if features['temperature_max'] > 35:
            analysis['high_temperature'] = True
        if features['error_count'] > 3:
            analysis['high_error_rate'] = True
        if features['days_since_maintenance'] > 180:
            analysis['overdue_maintenance'] = True
        
        return analysis
    
    def save_model(self, filepath: str):
        """Save the trained model"""
        try:
            if not self.is_trained:
                raise ValueError("Model not trained")
            
            model_data = {
                'model': self.model,
                'scaler': self.scaler,
                'label_encoder': self.label_encoder,
                'feature_columns': self.feature_columns,
                'maintenance_types': self.maintenance_types,
                'is_trained': self.is_trained
            }
            
            joblib.dump(model_data, filepath)
            logger.info(f"Maintenance model saved to {filepath}")
            
        except Exception as e:
            logger.error(f"Error saving maintenance model: {e}")
            raise
    
    def load_model(self, filepath: str):
        """Load a trained model"""
        try:
            model_data = joblib.load(filepath)
            
            self.model = model_data['model']
            self.scaler = model_data['scaler']
            self.label_encoder = model_data['label_encoder']
            self.feature_columns = model_data['feature_columns']
            self.maintenance_types = model_data['maintenance_types']
            self.is_trained = model_data['is_trained']
            
            logger.info(f"Maintenance model loaded from {filepath}")
            
        except Exception as e:
            logger.error(f"Error loading maintenance model: {e}")
            raise
