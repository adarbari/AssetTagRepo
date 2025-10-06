"""
Train anomaly detection model
"""
import logging
import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, confusion_matrix
import asyncio
from datetime import datetime, timedelta

from ml.mlflow_client import log_anomaly_detection_model
from config.database import get_db
from sqlalchemy import text

logger = logging.getLogger(__name__)


async def generate_training_data():
    """Generate synthetic training data for anomaly detection"""
    try:
        # This would normally query real data from the database
        # For now, we'll generate synthetic data
        
        np.random.seed(42)
        n_samples = 1000
        
        # Generate normal data
        normal_data = {
            'avg_rssi': np.random.normal(-60, 10, n_samples),
            'min_rssi': np.random.normal(-80, 15, n_samples),
            'max_rssi': np.random.normal(-40, 8, n_samples),
            'rssi_std': np.random.exponential(5, n_samples),
            'avg_battery': np.random.normal(75, 15, n_samples),
            'avg_temperature': np.random.normal(25, 5, n_samples),
            'gateway_count': np.random.poisson(3, n_samples),
            'current_confidence': np.random.beta(2, 2, n_samples),
            'current_speed': np.random.exponential(2, n_samples),
            'hour_of_day': np.random.randint(0, 24, n_samples),
            'day_of_week': np.random.randint(0, 7, n_samples),
            'is_weekend': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
            'baseline_avg_temperature': np.random.normal(25, 2, n_samples),
            'baseline_typical_confidence': np.random.beta(3, 2, n_samples),
            'baseline_normal_battery_drain_rate': np.random.exponential(0.1, n_samples)
        }
        
        # Generate anomaly data
        anomaly_data = {
            'avg_rssi': np.random.normal(-90, 15, 100),  # Very weak signal
            'min_rssi': np.random.normal(-100, 20, 100),
            'max_rssi': np.random.normal(-70, 10, 100),
            'rssi_std': np.random.exponential(15, 100),  # High variance
            'avg_battery': np.random.normal(15, 10, 100),  # Low battery
            'avg_temperature': np.random.normal(45, 10, 100),  # High temperature
            'gateway_count': np.random.poisson(1, 100),  # Few gateways
            'current_confidence': np.random.beta(1, 3, 100),  # Low confidence
            'current_speed': np.random.exponential(10, 100),  # High speed
            'hour_of_day': np.random.randint(0, 24, 100),
            'day_of_week': np.random.randint(0, 7, 100),
            'is_weekend': np.random.choice([0, 1], 100, p=[0.7, 0.3]),
            'baseline_avg_temperature': np.random.normal(25, 2, 100),
            'baseline_typical_confidence': np.random.beta(3, 2, 100),
            'baseline_normal_battery_drain_rate': np.random.exponential(0.1, 100)
        }
        
        # Combine data
        normal_df = pd.DataFrame(normal_data)
        anomaly_df = pd.DataFrame(anomaly_data)
        
        # Add labels
        normal_df['is_anomaly'] = 0
        anomaly_df['is_anomaly'] = 1
        
        # Combine and shuffle
        combined_df = pd.concat([normal_df, anomaly_df], ignore_index=True)
        combined_df = combined_df.sample(frac=1).reset_index(drop=True)
        
        return combined_df
        
    except Exception as e:
        logger.error(f"Error generating training data: {e}")
        return None


async def train_anomaly_detection_model():
    """Train anomaly detection model"""
    try:
        logger.info("Starting anomaly detection model training...")
        
        # Generate training data
        df = await generate_training_data()
        if df is None:
            logger.error("Failed to generate training data")
            return None
        
        # Prepare features and labels
        feature_columns = [col for col in df.columns if col != 'is_anomaly']
        X = df[feature_columns]
        y = df['is_anomaly']
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train model
        model = IsolationForest(
            contamination=0.1,  # 10% contamination
            random_state=42,
            n_estimators=100
        )
        
        model.fit(X_train_scaled)
        
        # Make predictions
        y_pred = model.predict(X_test_scaled)
        y_pred_binary = (y_pred == -1).astype(int)  # Convert to binary
        
        # Calculate metrics
        from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
        
        accuracy = accuracy_score(y_test, y_pred_binary)
        precision = precision_score(y_test, y_pred_binary)
        recall = recall_score(y_test, y_pred_binary)
        f1 = f1_score(y_test, y_pred_binary)
        
        metrics = {
            "accuracy": accuracy,
            "precision": precision,
            "recall": recall,
            "f1_score": f1
        }
        
        params = {
            "contamination": 0.1,
            "n_estimators": 100,
            "random_state": 42,
            "algorithm": "isolation_forest"
        }
        
        # Log to MLflow
        run_id = log_anomaly_detection_model(model, metrics, params)
        
        logger.info(f"Model training completed. Run ID: {run_id}")
        logger.info(f"Metrics: {metrics}")
        
        return {
            "model": model,
            "scaler": scaler,
            "metrics": metrics,
            "params": params,
            "run_id": run_id,
            "feature_columns": feature_columns
        }
        
    except Exception as e:
        logger.error(f"Error training anomaly detection model: {e}")
        return None


async def main():
    """Main training function"""
    try:
        result = await train_anomaly_detection_model()
        
        if result:
            logger.info("Anomaly detection model training completed successfully")
            return result
        else:
            logger.error("Anomaly detection model training failed")
            return None
            
    except Exception as e:
        logger.error(f"Error in main training function: {e}")
        return None


if __name__ == "__main__":
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Run training
    result = asyncio.run(main())
    
    if result:
        print("Training completed successfully!")
        print(f"Model metrics: {result['metrics']}")
    else:
        print("Training failed!")
