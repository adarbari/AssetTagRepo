"""
Model loader for ML model serving
"""
import logging
import asyncio
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
import threading
import time

from ml.mlflow_client import get_mlflow_client, MLflowClient
from config.cache import get_cache

logger = logging.getLogger(__name__)


class ModelLoader:
    """Loads and manages ML models for serving"""

    def __init__(self):
        self.mlflow_client = get_mlflow_client()
        self.cache = None
        self.models = {}
        self.model_metadata = {}
        self.load_lock = asyncio.Lock()
        self.last_refresh = {}
        self.refresh_interval = timedelta(hours=1)  # Refresh models every hour

    async def _get_cache(self):
        """Get cache manager"""
        if not self.cache:
            self.cache = await get_cache()
        return self.cache

    async def load_model(
        self, model_name: str, model_type: str = "sklearn"
    ) -> Optional[Any]:
        """Load model from MLflow or cache"""
        try:
            async with self.load_lock:
                # Check if model is already loaded and fresh
                if self._is_model_fresh(model_name):
                    logger.debug(f"Using cached model: {model_name}")
                    return self.models.get(model_name)

                # Try to load from cache first
                cache = await self._get_cache()
                cached_model = await cache.get_with_strategy(
                    "ml_predictions", asset_id=model_name
                )

                if cached_model and self._is_model_fresh(model_name):
                    self.models[model_name] = cached_model
                    return cached_model

                # Load from MLflow
                model_uri = self.mlflow_client.get_latest_model(
                    "anomaly_detection", model_name
                )
                if not model_uri:
                    logger.warning(f"No model found for {model_name}")
                    return None

                model = self.mlflow_client.load_model(model_uri, model_type)

                # Store in memory and cache
                self.models[model_name] = model
                self.model_metadata[model_name] = {
                    "loaded_at": datetime.now(),
                    "model_uri": model_uri,
                    "model_type": model_type,
                }
                self.last_refresh[model_name] = datetime.now()

                # Cache the model (with longer TTL for models)
                await cache.set_with_strategy(
                    "ml_predictions", model, asset_id=model_name
                )

                logger.info(f"Loaded model: {model_name} from {model_uri}")
                return model

        except Exception as e:
            logger.error(f"Error loading model {model_name}: {e}")
            return None

    def _is_model_fresh(self, model_name: str) -> bool:
        """Check if model is fresh (loaded recently)"""
        if model_name not in self.last_refresh:
            return False

        return datetime.now() - self.last_refresh[model_name] < self.refresh_interval

    async def get_model(
        self, model_name: str, model_type: str = "sklearn"
    ) -> Optional[Any]:
        """Get model, loading if necessary"""
        if model_name in self.models and self._is_model_fresh(model_name):
            return self.models[model_name]

        return await self.load_model(model_name, model_type)

    async def refresh_model(self, model_name: str) -> bool:
        """Force refresh a model"""
        try:
            async with self.load_lock:
                # Remove from cache
                if model_name in self.models:
                    del self.models[model_name]
                if model_name in self.model_metadata:
                    del self.model_metadata[model_name]
                if model_name in self.last_refresh:
                    del self.last_refresh[model_name]

                # Load fresh model
                model = await self.load_model(model_name)
                return model is not None

        except Exception as e:
            logger.error(f"Error refreshing model {model_name}: {e}")
            return False

    async def refresh_all_models(self) -> Dict[str, bool]:
        """Refresh all loaded models"""
        results = {}
        for model_name in list(self.models.keys()):
            results[model_name] = await self.refresh_model(model_name)
        return results

    def get_loaded_models(self) -> List[str]:
        """Get list of currently loaded models"""
        return list(self.models.keys())

    def get_model_info(self, model_name: str) -> Optional[Dict[str, Any]]:
        """Get information about a loaded model"""
        if model_name not in self.model_metadata:
            return None

        metadata = self.model_metadata[model_name].copy()
        metadata["is_fresh"] = self._is_model_fresh(model_name)
        return metadata

    async def unload_model(self, model_name: str) -> bool:
        """Unload a model from memory"""
        try:
            async with self.load_lock:
                if model_name in self.models:
                    del self.models[model_name]
                if model_name in self.model_metadata:
                    del self.model_metadata[model_name]
                if model_name in self.last_refresh:
                    del self.last_refresh[model_name]

                logger.info(f"Unloaded model: {model_name}")
                return True

        except Exception as e:
            logger.error(f"Error unloading model {model_name}: {e}")
            return False

    async def preload_models(self, model_names: List[str]) -> Dict[str, bool]:
        """Preload multiple models"""
        results = {}
        for model_name in model_names:
            model = await self.load_model(model_name)
            results[model_name] = model is not None
        return results


class ModelRefreshScheduler:
    """Background scheduler for model refresh"""

    def __init__(self, model_loader: ModelLoader):
        self.model_loader = model_loader
        self.running = False
        self.refresh_task = None

    async def start(self, refresh_interval: int = 3600):  # 1 hour default
        """Start the refresh scheduler"""
        if self.running:
            return

        self.running = True
        self.refresh_task = asyncio.create_task(self._refresh_loop(refresh_interval))
        logger.info("Model refresh scheduler started")

    async def stop(self):
        """Stop the refresh scheduler"""
        self.running = False
        if self.refresh_task:
            self.refresh_task.cancel()
            try:
                await self.refresh_task
            except asyncio.CancelledError:
                pass
        logger.info("Model refresh scheduler stopped")

    async def _refresh_loop(self, refresh_interval: int):
        """Background refresh loop"""
        while self.running:
            try:
                await asyncio.sleep(refresh_interval)

                if self.running:
                    logger.info("Starting scheduled model refresh")
                    results = await self.model_loader.refresh_all_models()

                    refreshed = sum(1 for success in results.values() if success)
                    total = len(results)
                    logger.info(
                        f"Model refresh completed: {refreshed}/{total} models refreshed"
                    )

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in model refresh loop: {e}")
                await asyncio.sleep(60)  # Wait 1 minute before retrying


# Global model loader instance
model_loader = ModelLoader()
refresh_scheduler = ModelRefreshScheduler(model_loader)


async def get_model_loader() -> ModelLoader:
    """Get model loader instance"""
    return model_loader


async def start_model_refresh_scheduler():
    """Start the model refresh scheduler"""
    await refresh_scheduler.start()


async def stop_model_refresh_scheduler():
    """Stop the model refresh scheduler"""
    await refresh_scheduler.stop()


# Model loading utilities
async def load_anomaly_detection_model() -> Optional[Any]:
    """Load the anomaly detection model"""
    return await model_loader.get_model("anomaly_detector", "sklearn")


async def load_location_prediction_model() -> Optional[Any]:
    """Load the location prediction model"""
    return await model_loader.get_model("location_predictor", "sklearn")


async def load_battery_degradation_model() -> Optional[Any]:
    """Load the battery degradation model"""
    return await model_loader.get_model("battery_predictor", "sklearn")


# Model preloading for common models
async def preload_common_models():
    """Preload commonly used models"""
    common_models = ["anomaly_detector", "location_predictor", "battery_predictor"]

    results = await model_loader.preload_models(common_models)
    loaded = sum(1 for success in results.values() if success)
    logger.info(f"Preloaded {loaded}/{len(common_models)} common models")

    return results
