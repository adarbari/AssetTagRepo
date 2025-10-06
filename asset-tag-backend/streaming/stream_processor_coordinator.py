"""
Stream processor coordinator for managing all streaming processors
"""

import asyncio
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from streaming.processors.anomaly_processor import (get_anomaly_processor,
                                                    start_anomaly_processor,
                                                    stop_anomaly_processor)
from streaming.processors.geofence_processor import (get_geofence_processor,
                                                     start_geofence_processor,
                                                     stop_geofence_processor)
from streaming.processors.location_processor import (get_location_processor,
                                                     start_location_processor,
                                                     stop_location_processor)

logger = logging.getLogger(__name__)


class StreamProcessorCoordinator:
    """Coordinates all streaming processors"""

    def __init__(self) -> None:
        self.processors = {}
        self.running = False
        self.startup_tasks = []

    async def start_all_processors(self) -> None:
        """Start all streaming processors"""
        if self.running:
            logger.warning("Stream processors already running")
            return

        try:
            logger.info("Starting all stream processors...")

            # Initialize processors
            self.processors = {
                "location": await get_location_processor(),
                "anomaly": await get_anomaly_processor(),
                "geofence": await get_geofence_processor(),
            }

            # Start processors in parallel
            self.startup_tasks = [
                asyncio.create_task(start_location_processor()),
                asyncio.create_task(start_anomaly_processor()),
                asyncio.create_task(start_geofence_processor()),
            ]

            # Wait for all processors to start
            await asyncio.gather(*self.startup_tasks, return_exceptions=True)

            self.running = True
            logger.info("All stream processors started successfully")

        except Exception as e:
            logger.error(f"Error starting stream processors: {e}")
            await self.stop_all_processors()
            raise

    async def stop_all_processors(self) -> None:
        """Stop all streaming processors"""
        if not self.running:
            return

        try:
            logger.info("Stopping all stream processors...")

            # Stop processors in parallel
            stop_tasks = [
                asyncio.create_task(stop_location_processor()),
                asyncio.create_task(stop_anomaly_processor()),
                asyncio.create_task(stop_geofence_processor()),
            ]

            # Wait for all processors to stop
            await asyncio.gather(*stop_tasks, return_exceptions=True)

            # Cancel any pending startup tasks
            for task in self.startup_tasks:
                if not task.done():
                    task.cancel()

            self.running = False
            logger.info("All stream processors stopped")

        except Exception as e:
            logger.error(f"Error stopping stream processors: {e}")

    async def process_observation(self, observation_data: Dict[str, Any]) -> None:
        """Process observation through all relevant processors"""
        try:
            # Process through location processor
            location_processor = await get_location_processor()
            await location_processor.process_observation(observation_data)

        except Exception as e:
            logger.error(f"Error processing observation: {e}")

    async def process_location_update(self, location_data: Dict[str, Any]) -> None:
        """Process location update through downstream processors"""
        try:
            # Process through anomaly processor
            anomaly_processor = await get_anomaly_processor()
            await anomaly_processor.process_location_update(location_data)

            # Process through geofence processor
            geofence_processor = await get_geofence_processor()
            await geofence_processor.process_location_update(location_data)

        except Exception as e:
            logger.error(f"Error processing location update: {e}")

    async def get_all_processor_stats(self) -> Dict[str, Any]:
        """Get statistics from all processors"""
        try:
            stats = {
                "coordinator": {
                    "running": self.running,
                    "processors": list(self.processors.keys()),
                }
            }

            # Get stats from each processor
            for name, processor in self.processors.items():
                try:
                    processor_stats = await processor.get_processing_stats()
                    stats[name] = processor_stats
                except Exception as e:
                    stats[name] = {"error": str(e)}

            return stats

        except Exception as e:
            logger.error(f"Error getting processor stats: {e}")
            return {"error": str(e)}

    async def health_check(self) -> Dict[str, Any]:
        """Health check for all processors"""
        try:
            health_status = {
                "overall_status": "healthy",
                "timestamp": datetime.now().isoformat(),
                "processors": {},
            }

            # Check each processor
            for name, processor in self.processors.items():
                try:
                    stats = await processor.get_processing_stats()
                    processor_health = {
                        "status": (
                            "healthy" if stats.get("running", False) else "unhealthy"
                        ),
                        "running": stats.get("running", False),
                    }
                    health_status["processors"][name] = processor_health

                    if not stats.get("running", False):
                        health_status["overall_status"] = "unhealthy"

                except Exception as e:
                    health_status["processors"][name] = {
                        "status": "error",
                        "error": str(e),
                    }
                    health_status["overall_status"] = "unhealthy"

            return health_status

        except Exception as e:
            logger.error(f"Error in health check: {e}")
            return {
                "overall_status": "error",
                "error": str(e),
                "timestamp": datetime.now().isoformat(),
            }

    async def restart_processor(self, processor_name: str) -> bool:
        """Restart a specific processor"""
        try:
            if processor_name not in self.processors:
                logger.error(f"Unknown processor: {processor_name}")
                return False

            logger.info(f"Restarting processor: {processor_name}")

            # Stop the processor
            if processor_name == "location":
                await stop_location_processor()
            elif processor_name == "anomaly":
                await stop_anomaly_processor()
            elif processor_name == "geofence":
                await stop_geofence_processor()

            # Wait a moment
            await asyncio.sleep(1)

            # Start the processor
            if processor_name == "location":
                await start_location_processor()
            elif processor_name == "anomaly":
                await start_anomaly_processor()
            elif processor_name == "geofence":
                await start_geofence_processor()

            logger.info(f"Successfully restarted processor: {processor_name}")
            return True

        except Exception as e:
            logger.error(f"Error restarting processor {processor_name}: {e}")
            return False

    async def update_processor_config(
        self, processor_name: str, config: Dict[str, Any]
    ) -> bool:
        """Update configuration for a specific processor"""
        try:
            if processor_name not in self.processors:
                logger.error(f"Unknown processor: {processor_name}")
                return False

            processor = self.processors[processor_name]

            # Update configuration based on processor type
            if processor_name == "anomaly" and "anomaly_threshold" in config:
                await processor.update_anomaly_threshold(config["anomaly_threshold"])
                logger.info(
                    f"Updated {processor_name} anomaly threshold to {config['anomaly_threshold']}"
                )
                return True
            else:
                logger.warning(
                    f"No configurable parameters for processor {processor_name}"
                )
                return False

        except Exception as e:
            logger.error(f"Error updating processor config: {e}")
            return False


# Global coordinator instance
stream_coordinator = StreamProcessorCoordinator()


async def get_stream_coordinator() -> StreamProcessorCoordinator:
    """Get stream coordinator instance"""
    return stream_coordinator


async def start_all_stream_processors() -> None:
    """Start all stream processors"""
    await stream_coordinator.start_all_processors()


async def stop_all_stream_processors() -> None:
    """Stop all stream processors"""
    await stream_coordinator.stop_all_processors()
