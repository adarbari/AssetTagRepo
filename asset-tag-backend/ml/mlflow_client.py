"""
MLflow client for model tracking and management
"""

import logging
import os
import pickle
import tempfile
from datetime import datetime
from typing import Any, Dict, List, Optional

import mlflow
import mlflow.pytorch
import mlflow.sklearn
import mlflow.xgboost

from config.settings import settings

logger = logging.getLogger(__name__)


class MLflowClient:
    """MLflow client for model lifecycle management"""

    def __init__(self):
        self.tracking_uri = settings.mlflow_tracking_uri
        mlflow.set_tracking_uri(self.tracking_uri)
        self.experiments = {
            "anomaly_detection": "anomaly_detection",
            "location_prediction": "location_prediction",
            "battery_degradation": "battery_degradation",
            "asset_utilization": "asset_utilization",
        }
        self._setup_experiments()

    def _setup_experiments(self):
        """Setup MLflow experiments"""
        try:
            for exp_name, exp_id in self.experiments.items():
                try:
                    mlflow.create_experiment(exp_name)
                    logger.info(f"Created experiment: {exp_name}")
                except mlflow.exceptions.MlflowException:
                    # Experiment already exists
                    logger.debug(f"Experiment {exp_name} already exists")
        except Exception as e:
            logger.error(f"Error setting up experiments: {e}")

    def start_run(
        self, experiment_name: str, run_name: Optional[str] = None
    ) -> mlflow.ActiveRun:
        """Start a new MLflow run"""
        try:
            experiment_id = self.experiments.get(experiment_name)
            if not experiment_id:
                raise ValueError(f"Unknown experiment: {experiment_name}")

            return mlflow.start_run(
                experiment_id=experiment_id,
                run_name=run_name or f"run_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
            )
        except Exception as e:
            logger.error(f"Error starting run for experiment {experiment_name}: {e}")
            raise

    def log_model(self, model, model_name: str, model_type: str = "sklearn"):
        """Log model to MLflow"""
        try:
            if model_type == "sklearn":
                mlflow.sklearn.log_model(model, model_name)
            elif model_type == "xgboost":
                mlflow.xgboost.log_model(model, model_name)
            elif model_type == "pytorch":
                mlflow.pytorch.log_model(model, model_name)
            else:
                # Generic model logging
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pkl") as tmp:
                    pickle.dump(model, tmp)
                    mlflow.log_artifact(tmp.name, model_name)
                    os.unlink(tmp.name)

            logger.info(f"Logged {model_type} model: {model_name}")

        except Exception as e:
            logger.error(f"Error logging model {model_name}: {e}")
            raise

    def log_metrics(self, metrics: Dict[str, float]):
        """Log metrics to current run"""
        try:
            for key, value in metrics.items():
                mlflow.log_metric(key, value)
            logger.debug(f"Logged metrics: {list(metrics.keys())}")
        except Exception as e:
            logger.error(f"Error logging metrics: {e}")

    def log_params(self, params: Dict[str, Any]):
        """Log parameters to current run"""
        try:
            for key, value in params.items():
                mlflow.log_param(key, value)
            logger.debug(f"Logged parameters: {list(params.keys())}")
        except Exception as e:
            logger.error(f"Error logging parameters: {e}")

    def log_artifacts(self, artifacts_dir: str, artifact_path: Optional[str] = None):
        """Log artifacts to current run"""
        try:
            mlflow.log_artifacts(artifacts_dir, artifact_path)
            logger.info(f"Logged artifacts from: {artifacts_dir}")
        except Exception as e:
            logger.error(f"Error logging artifacts: {e}")

    def load_model(self, model_uri: str, model_type: str = "sklearn"):
        """Load model from MLflow"""
        try:
            if model_type == "sklearn":
                return mlflow.sklearn.load_model(model_uri)
            elif model_type == "xgboost":
                return mlflow.xgboost.load_model(model_uri)
            elif model_type == "pytorch":
                return mlflow.pytorch.load_model(model_uri)
            else:
                # Generic model loading
                return mlflow.pyfunc.load_model(model_uri)
        except Exception as e:
            logger.error(f"Error loading model from {model_uri}: {e}")
            raise

    def get_latest_model(self, experiment_name: str, model_name: str) -> Optional[str]:
        """Get the latest model URI for an experiment"""
        try:
            experiment_id = self.experiments.get(experiment_name)
            if not experiment_id:
                return None

            runs = mlflow.search_runs(
                experiment_ids=[experiment_id],
                order_by=["start_time DESC"],
                max_results=1,
            )

            if runs.empty:
                return None

            run_id = runs.iloc[0]["run_id"]
            model_uri = f"runs:/{run_id}/{model_name}"

            return model_uri

        except Exception as e:
            logger.error(f"Error getting latest model for {experiment_name}: {e}")
            return None

    def get_experiment_runs(
        self, experiment_name: str, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """Get recent runs for an experiment"""
        try:
            experiment_id = self.experiments.get(experiment_name)
            if not experiment_id:
                return []

            runs = mlflow.search_runs(
                experiment_ids=[experiment_id],
                order_by=["start_time DESC"],
                max_results=limit,
            )

            return runs.to_dict("records")

        except Exception as e:
            logger.error(f"Error getting runs for {experiment_name}: {e}")
            return []

    def get_model_versions(self, model_name: str) -> List[Dict[str, Any]]:
        """Get all versions of a model"""
        try:
            client = mlflow.tracking.MlflowClient()
            versions = client.get_latest_versions(model_name)

            return [
                {
                    "version": version.version,
                    "stage": version.current_stage,
                    "creation_timestamp": version.creation_timestamp,
                    "last_updated_timestamp": version.last_updated_timestamp,
                    "description": version.description,
                }
                for version in versions
            ]

        except Exception as e:
            logger.error(f"Error getting model versions for {model_name}: {e}")
            return []

    def promote_model(self, model_name: str, version: str, stage: str = "Production"):
        """Promote model to a specific stage"""
        try:
            client = mlflow.tracking.MlflowClient()
            client.transition_model_version_stage(
                name=model_name, version=version, stage=stage
            )
            logger.info(f"Promoted model {model_name} version {version} to {stage}")

        except Exception as e:
            logger.error(f"Error promoting model {model_name}: {e}")
            raise

    def delete_model(self, model_name: str, version: Optional[str] = None):
        """Delete a model or model version"""
        try:
            client = mlflow.tracking.MlflowClient()

            if version:
                client.delete_model_version(model_name, version)
                logger.info(f"Deleted model {model_name} version {version}")
            else:
                client.delete_registered_model(model_name)
                logger.info(f"Deleted model {model_name}")

        except Exception as e:
            logger.error(f"Error deleting model {model_name}: {e}")
            raise

    def get_model_info(self, model_uri: str) -> Optional[Dict[str, Any]]:
        """Get information about a model"""
        try:
            client = mlflow.tracking.MlflowClient()

            # Parse model URI
            if model_uri.startswith("runs:/"):
                run_id, model_path = model_uri.split("/", 2)[1:]
                run = client.get_run(run_id)

                return {
                    "run_id": run_id,
                    "experiment_id": run.data.experiment_id,
                    "start_time": run.info.start_time,
                    "end_time": run.info.end_time,
                    "status": run.info.status,
                    "model_path": model_path,
                    "metrics": run.data.metrics,
                    "params": run.data.params,
                }
            else:
                # Registered model
                model = client.get_registered_model(model_uri)
                return {
                    "name": model.name,
                    "description": model.description,
                    "creation_timestamp": model.creation_timestamp,
                    "last_updated_timestamp": model.last_updated_timestamp,
                    "versions": len(model.latest_versions),
                }

        except Exception as e:
            logger.error(f"Error getting model info for {model_uri}: {e}")
            return None


# Global MLflow client instance
mlflow_client = MLflowClient()


def get_mlflow_client() -> MLflowClient:
    """Get MLflow client instance"""
    return mlflow_client


# Context manager for MLflow runs
class MLflowRun:
    """Context manager for MLflow runs"""

    def __init__(self, experiment_name: str, run_name: Optional[str] = None):
        self.experiment_name = experiment_name
        self.run_name = run_name
        self.run = None

    def __enter__(self):
        self.run = mlflow_client.start_run(self.experiment_name, self.run_name)
        return self.run

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.run:
            mlflow.end_run()


# Utility functions
def log_anomaly_detection_model(
    model, metrics: Dict[str, float], params: Dict[str, Any]
):
    """Log anomaly detection model to MLflow"""
    with MLflowRun("anomaly_detection") as run:
        mlflow_client.log_params(params)
        mlflow_client.log_metrics(metrics)
        mlflow_client.log_model(model, "anomaly_detector", "sklearn")
        return run.info.run_id


def log_location_prediction_model(
    model, metrics: Dict[str, float], params: Dict[str, Any]
):
    """Log location prediction model to MLflow"""
    with MLflowRun("location_prediction") as run:
        mlflow_client.log_params(params)
        mlflow_client.log_metrics(metrics)
        mlflow_client.log_model(model, "location_predictor", "sklearn")
        return run.info.run_id


def load_production_model(model_name: str, model_type: str = "sklearn"):
    """Load production model from MLflow"""
    model_uri = mlflow_client.get_latest_model("anomaly_detection", model_name)
    if model_uri:
        return mlflow_client.load_model(model_uri, model_type)
    return None
