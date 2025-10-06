"""
Enhanced anomaly detection processor
"""
import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from collections import defaultdict, deque

from config.database import get_db
from config.cache import get_cache
from ml.serving.inference import get_inference_engine, InferenceEngine
from ml.features.feature_store import get_feature_store, FeatureStore
from modules.alerts.models import Alert
from modules.assets.models import Asset

logger = logging.getLogger(__name__)


class AnomalyProcessor:
    """Enhanced anomaly detection processor with ML integration"""

    def __init__(
        self, processing_interval: float = 30.0, anomaly_threshold: float = 0.7
    ):
        self.processing_interval = processing_interval
        self.anomaly_threshold = anomaly_threshold
        self.inference_engine = None
        self.feature_store = None
        self.cache = None
        self.db = None
        self.running = False
        self.processing_task = None
        self.asset_cooldowns = defaultdict(lambda: datetime.min)  # Prevent spam alerts
        self.cooldown_duration = timedelta(minutes=15)  # 15 minute cooldown

    async def _get_inference_engine(self) -> InferenceEngine:
        """Get inference engine"""
        if not self.inference_engine:
            self.inference_engine = await get_inference_engine()
        return self.inference_engine

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

    async def _get_db(self):
        """Get database session"""
        if not self.db:
            self.db = await get_db()
        return self.db

    async def start(self):
        """Start the anomaly processor"""
        if self.running:
            return

        self.running = True
        self.processing_task = asyncio.create_task(self._processing_loop())
        logger.info("Anomaly processor started")

    async def stop(self):
        """Stop the anomaly processor"""
        self.running = False
        if self.processing_task:
            self.processing_task.cancel()
            try:
                await self.processing_task
            except asyncio.CancelledError:
                pass
        logger.info("Anomaly processor stopped")

    async def process_location_update(self, location_data: Dict[str, Any]):
        """Process location update for anomaly detection"""
        try:
            asset_id = location_data.get("asset_id")
            if not asset_id:
                return

            # Check cooldown
            if self._is_in_cooldown(asset_id):
                logger.debug(
                    f"Asset {asset_id} in cooldown, skipping anomaly detection"
                )
                return

            # Trigger anomaly detection
            await self._detect_anomaly(asset_id, location_data)

        except Exception as e:
            logger.error(f"Error processing location update for anomaly detection: {e}")

    async def _processing_loop(self):
        """Main processing loop for periodic anomaly detection"""
        while self.running:
            try:
                await asyncio.sleep(self.processing_interval)

                if self.running:
                    await self._periodic_anomaly_detection()

            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Error in anomaly processing loop: {e}")
                await asyncio.sleep(60)  # Wait before retrying

    async def _periodic_anomaly_detection(self):
        """Periodic anomaly detection for all active assets"""
        try:
            # Get all active assets
            db = await self._get_db()
            assets = await db.execute(
                "SELECT id FROM assets WHERE status = 'active' AND deleted_at IS NULL"
            )
            asset_ids = [str(row.id) for row in assets.fetchall()]

            # Process assets in parallel (with concurrency limit)
            semaphore = asyncio.Semaphore(10)  # Limit concurrent processing

            tasks = []
            for asset_id in asset_ids:
                if not self._is_in_cooldown(asset_id):
                    task = asyncio.create_task(
                        self._detect_anomaly_with_semaphore(semaphore, asset_id)
                    )
                    tasks.append(task)

            # Wait for all tasks to complete
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)

        except Exception as e:
            logger.error(f"Error in periodic anomaly detection: {e}")

    async def _detect_anomaly_with_semaphore(
        self, semaphore: asyncio.Semaphore, asset_id: str
    ):
        """Detect anomaly with semaphore for concurrency control"""
        async with semaphore:
            await self._detect_anomaly(asset_id)

    async def _detect_anomaly(
        self, asset_id: str, location_data: Optional[Dict[str, Any]] = None
    ):
        """Detect anomaly for a specific asset"""
        try:
            # Get inference engine
            inference_engine = await self._get_inference_engine()

            # Get anomaly prediction
            prediction = await inference_engine.predict_anomaly(asset_id)

            if not prediction or "error" in prediction:
                logger.warning(f"Could not get anomaly prediction for asset {asset_id}")
                return

            anomaly_score = prediction.get("anomaly_score", 0.0)
            is_anomalous = prediction.get("is_anomalous", False)
            confidence = prediction.get("confidence", 0.0)

            # Check if anomaly threshold is exceeded
            if is_anomalous and confidence > 0.5:
                await self._create_anomaly_alert(
                    asset_id, anomaly_score, confidence, prediction
                )
                self._set_cooldown(asset_id)

            logger.debug(
                f"Anomaly detection for asset {asset_id}: score={anomaly_score:.3f}, anomalous={is_anomalous}"
            )

        except Exception as e:
            logger.error(f"Error detecting anomaly for asset {asset_id}: {e}")

    async def _create_anomaly_alert(
        self,
        asset_id: str,
        anomaly_score: float,
        confidence: float,
        prediction: Dict[str, Any],
    ):
        """Create anomaly alert"""
        try:
            db = await self._get_db()

            # Get asset information
            asset = await db.get(Asset, asset_id)
            if not asset:
                logger.warning(f"Asset {asset_id} not found for anomaly alert")
                return

            # Determine alert severity based on anomaly score
            if anomaly_score > 0.9:
                severity = "critical"
            elif anomaly_score > 0.8:
                severity = "warning"
            else:
                severity = "info"

            # Create alert message
            message = f"Anomalous behavior detected for asset {asset.name}"
            description = (
                f"Anomaly score: {anomaly_score:.3f}, Confidence: {confidence:.3f}"
            )

            # Get current location if available
            location_description = None
            latitude = None
            longitude = None

            if prediction.get("features", {}).get("current_confidence"):
                location_description = f"Last known location (confidence: {prediction['features']['current_confidence']:.2f})"

            # Create alert
            alert = Alert(
                organization_id=asset.organization_id,
                alert_type="anomaly_detection",
                severity=severity,
                status="active",
                asset_id=asset_id,
                asset_name=asset.name,
                message=message,
                description=description,
                reason=f"ML model detected anomalous behavior with score {anomaly_score:.3f}",
                suggested_action="Review asset status and recent activity",
                location_description=location_description,
                latitude=latitude,
                longitude=longitude,
                triggered_at=datetime.now(),
                auto_resolvable=True,
                metadata={
                    "anomaly_score": anomaly_score,
                    "confidence": confidence,
                    "model_type": prediction.get("model_type", "unknown"),
                    "features_used": prediction.get("features_used", 0),
                    "baseline_available": prediction.get("baseline_available", False),
                },
            )

            db.add(alert)
            await db.commit()

            logger.info(
                f"Created anomaly alert for asset {asset_id} with score {anomaly_score:.3f}"
            )

        except Exception as e:
            logger.error(f"Error creating anomaly alert for asset {asset_id}: {e}")

    def _is_in_cooldown(self, asset_id: str) -> bool:
        """Check if asset is in cooldown period"""
        return datetime.now() - self.asset_cooldowns[asset_id] < self.cooldown_duration

    def _set_cooldown(self, asset_id: str):
        """Set cooldown for asset"""
        self.asset_cooldowns[asset_id] = datetime.now()

    async def get_processing_stats(self) -> Dict[str, Any]:
        """Get processing statistics"""
        try:
            # Count assets in cooldown
            assets_in_cooldown = sum(
                1
                for cooldown_time in self.asset_cooldowns.values()
                if datetime.now() - cooldown_time < self.cooldown_duration
            )

            return {
                "running": self.running,
                "processing_interval": self.processing_interval,
                "anomaly_threshold": self.anomaly_threshold,
                "cooldown_duration_minutes": self.cooldown_duration.total_seconds()
                / 60,
                "assets_in_cooldown": assets_in_cooldown,
                "total_cooldown_entries": len(self.asset_cooldowns),
            }

        except Exception as e:
            logger.error(f"Error getting processing stats: {e}")
            return {"error": str(e)}

    async def force_anomaly_detection(self, asset_id: str) -> Dict[str, Any]:
        """Force anomaly detection for a specific asset (bypass cooldown)"""
        try:
            # Clear cooldown
            self.asset_cooldowns[asset_id] = datetime.min

            # Detect anomaly
            await self._detect_anomaly(asset_id)

            return {
                "asset_id": asset_id,
                "forced_detection": True,
                "timestamp": datetime.now().isoformat(),
            }

        except Exception as e:
            logger.error(f"Error in forced anomaly detection for asset {asset_id}: {e}")
            return {"error": str(e)}

    async def update_anomaly_threshold(self, new_threshold: float):
        """Update anomaly detection threshold"""
        if 0.0 <= new_threshold <= 1.0:
            self.anomaly_threshold = new_threshold
            logger.info(f"Updated anomaly threshold to {new_threshold}")
            return True
        else:
            logger.error(f"Invalid anomaly threshold: {new_threshold}")
            return False


# Global anomaly processor instance
anomaly_processor = AnomalyProcessor()


async def get_anomaly_processor() -> AnomalyProcessor:
    """Get anomaly processor instance"""
    return anomaly_processor


async def start_anomaly_processor():
    """Start the anomaly processor"""
    await anomaly_processor.start()


async def stop_anomaly_processor():
    """Stop the anomaly processor"""
    await anomaly_processor.stop()
