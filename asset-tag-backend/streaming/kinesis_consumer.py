"""
Kinesis/Redpanda consumer for Bluetooth observations
"""
import asyncio
import json
import logging
from datetime import datetime
from typing import Any, AsyncGenerator, Dict

import boto3
from aiokafka import AIOKafkaConsumer

from config.settings import settings
from config.streaming import StreamingManager

logger = logging.getLogger(__name__)


class ObservationConsumer:
    """Consumer for Bluetooth observations from Kinesis/Redpanda"""

    def __init__(self, streaming_manager: StreamingManager):
        self.streaming_manager = streaming_manager
        self.stream_name = settings.kinesis_stream_name
        self.is_running = False

    async def start(self):
        """Start consuming observations"""
        self.is_running = True
        logger.info(f"Starting observation consumer for stream: {self.stream_name}")

        try:
            async for message in self.streaming_manager.consume_messages(
                self.stream_name
            ):
                if not self.is_running:
                    break

                await self._process_message(message)

        except Exception as e:
            logger.error(f"Error in observation consumer: {e}")
            raise

    async def stop(self):
        """Stop consuming observations"""
        self.is_running = False
        logger.info("Stopping observation consumer")

    async def _process_message(self, message: Dict[str, Any]):
        """Process a single observation message"""
        try:
            # Parse the message
            observation_data = self._parse_observation(message)

            if observation_data:
                # Validate the observation
                if self._validate_observation(observation_data):
                    # Process the observation
                    await self._handle_observation(observation_data)
                else:
                    logger.warning(f"Invalid observation data: {observation_data}")
            else:
                logger.warning(f"Failed to parse message: {message}")

        except Exception as e:
            logger.error(f"Error processing message: {e}")

    def _parse_observation(self, message: Dict[str, Any]) -> Dict[str, Any]:
        """Parse observation from message"""
        try:
            # Extract the actual data from the message
            if settings.use_local_streaming:
                # Kafka/Redpanda message format
                data = message.get("value", {})
            else:
                # Kinesis message format
                data = message.get("value", {})

            # Ensure we have the required fields
            required_fields = ["asset_tag_id", "gateway_id", "rssi", "timestamp"]
            if not all(field in data for field in required_fields):
                logger.warning(f"Missing required fields in observation: {data}")
                return None

            return {
                "asset_tag_id": data["asset_tag_id"],
                "gateway_id": data["gateway_id"],
                "rssi": int(data["rssi"]),
                "battery_level": data.get("battery_level"),
                "temperature": data.get("temperature"),
                "timestamp": data["timestamp"],
                "metadata": data.get("metadata", {}),
            }

        except Exception as e:
            logger.error(f"Error parsing observation: {e}")
            return None

    def _validate_observation(self, observation: Dict[str, Any]) -> bool:
        """Validate observation data"""
        try:
            # Check required fields
            if not observation.get("asset_tag_id"):
                return False

            if not observation.get("gateway_id"):
                return False

            # Check RSSI range (typically -100 to -30 dBm)
            rssi = observation.get("rssi")
            if rssi is None or not (-100 <= rssi <= -30):
                logger.warning(f"Invalid RSSI value: {rssi}")
                return False

            # Check battery level if provided
            battery = observation.get("battery_level")
            if battery is not None and not (0 <= battery <= 100):
                logger.warning(f"Invalid battery level: {battery}")
                return False

            # Check temperature if provided
            temperature = observation.get("temperature")
            if temperature is not None and not (-50 <= temperature <= 100):
                logger.warning(f"Invalid temperature: {temperature}")
                return False

            return True

        except Exception as e:
            logger.error(f"Error validating observation: {e}")
            return False

    async def _handle_observation(self, observation: Dict[str, Any]):
        """Handle a valid observation"""
        try:
            # Import here to avoid circular imports
            from streaming.observation_processor import ObservationProcessor

            processor = ObservationProcessor()
            await processor.process_observation(observation)

        except Exception as e:
            logger.error(f"Error handling observation: {e}")


class MockObservationProducer:
    """Mock producer for testing - generates fake observations"""

    def __init__(self, streaming_manager: StreamingManager):
        self.streaming_manager = streaming_manager
        self.stream_name = settings.kinesis_stream_name
        self.is_running = False

    async def start(self):
        """Start producing mock observations"""
        self.is_running = True
        logger.info("Starting mock observation producer")

        # Mock data
        mock_assets = [
            {"id": "asset-001", "name": "Excavator-001"},
            {"id": "asset-002", "name": "Truck-002"},
            {"id": "asset-003", "name": "Crane-003"},
        ]

        mock_gateways = [
            {"id": "gateway-001", "lat": 37.7749, "lng": -122.4194},
            {"id": "gateway-002", "lat": 37.7849, "lng": -122.4094},
            {"id": "gateway-003", "lat": 37.7649, "lng": -122.4294},
        ]

        while self.is_running:
            try:
                # Generate random observation
                asset = mock_assets[0]  # Use first asset for simplicity
                gateway = mock_gateways[0]  # Use first gateway for simplicity

                observation = {
                    "asset_tag_id": asset["id"],
                    "gateway_id": gateway["id"],
                    "rssi": -65,  # Good signal strength
                    "battery_level": 85,
                    "temperature": 22.5,
                    "timestamp": datetime.now().isoformat(),
                    "metadata": {
                        "source": "mock_producer",
                        "gateway_location": {
                            "lat": gateway["lat"],
                            "lng": gateway["lng"],
                        },
                    },
                }

                # Send to stream
                await self.streaming_manager.produce_message(
                    self.stream_name, observation, key=asset["id"]
                )

                logger.debug(f"Produced mock observation: {observation}")

                # Wait before next observation
                await asyncio.sleep(5)  # 5 seconds between observations

            except Exception as e:
                logger.error(f"Error producing mock observation: {e}")
                await asyncio.sleep(1)

    async def stop(self):
        """Stop producing mock observations"""
        self.is_running = False
        logger.info("Stopping mock observation producer")


async def start_observation_consumer():
    """Start the observation consumer"""
    from config.streaming import streaming

    consumer = ObservationConsumer(streaming)
    await consumer.start()


async def start_mock_producer():
    """Start the mock producer for testing"""
    from config.streaming import streaming

    producer = MockObservationProducer(streaming)
    await producer.start()


if __name__ == "__main__":
    # For testing
    async def main():
        if settings.environment == "local":
            # Start mock producer for local testing
            await start_mock_producer()
        else:
            # Start real consumer
            await start_observation_consumer()

    asyncio.run(main())
