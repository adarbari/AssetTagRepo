"""
Streaming configuration for Kafka/Redpanda and Kinesis
"""

import asyncio
import json
import logging
from typing import Any, AsyncGenerator, Dict, Optional

import boto3
from aiokafka import AIOKafkaConsumer, AIOKafkaProducer

from config.settings import settings

logger = logging.getLogger(__name__)


class StreamingManager:
    """Streaming manager for Kafka/Redpanda and Kinesis"""

    def __init__(self) -> None:
        self.producer = None
        self.consumer = None
        self.kinesis_client = None
        self._initialized = False

    def _setup_kafka(self) -> None:
        """Setup Kafka/Redpanda producer and consumer"""
        self.producer = AIOKafkaProducer(
            bootstrap_servers=settings.redpanda_brokers,
            value_serializer=lambda v: json.dumps(v).encode("utf-8"),
            key_serializer=lambda k: k.encode("utf-8") if k else None,
        )

        self.consumer = AIOKafkaConsumer(
            settings.kinesis_stream_name,
            bootstrap_servers=settings.redpanda_brokers,
            value_deserializer=lambda m: json.loads(m.decode("utf-8")),
            key_deserializer=lambda k: k.decode("utf-8") if k else None,
            group_id="asset-tag-consumer-group",
            auto_offset_reset="latest",
        )

    def _setup_kinesis(self) -> None:
        """Setup Kinesis client"""
        self.kinesis_client = boto3.client("kinesis", region_name=settings.aws_region)

    async def start(self) -> None:
        """Start streaming services"""
        if not getattr(settings, 'enable_streaming', True):
            logger.info("Streaming is disabled, skipping initialization")
            return
            
        if not self._initialized:
            if settings.use_local_streaming:
                self._setup_kafka()
            else:
                self._setup_kinesis()
            self._initialized = True

        if settings.use_local_streaming and self.producer:
            await self.producer.start()
            await self.consumer.start()
            logger.info("Kafka producer and consumer started")
        else:
            logger.info("Kinesis client ready")

    async def stop(self) -> None:
        """Stop streaming services"""
        if not getattr(settings, 'enable_streaming', True):
            logger.info("Streaming is disabled, nothing to stop")
            return
            
        if settings.use_local_streaming:
            if self.producer:
                await self.producer.stop()
            if self.consumer:
                await self.consumer.stop()
            logger.info("Kafka producer and consumer stopped")

    async def produce_message(
        self, topic: str, message: Dict[str, Any], key: Optional[str] = None
    ) -> bool:
        """Produce message to stream"""
        try:
            if settings.use_local_streaming:
                await self.producer.send_and_wait(topic, message, key=key)
            else:
                # Kinesis
                self.kinesis_client.put_record(
                    StreamName=topic,
                    Data=json.dumps(message),
                    PartitionKey=key or "default",
                )
            logger.debug(f"Message produced to {topic}")
            return True
        except Exception as e:
            logger.error(f"Message production error to {topic}: {e}")
            return False

    async def consume_messages(
        self, topic: str
    ) -> AsyncGenerator[Dict[str, Any], None]:
        """Consume messages from stream"""
        try:
            if settings.use_local_streaming:
                # Kafka consumer
                async for message in self.consumer:
                    if message.topic == topic:
                        yield {
                            "key": message.key,
                            "value": message.value,
                            "timestamp": message.timestamp,
                            "offset": message.offset,
                        }
            else:
                # Kinesis consumer
                shard_iterator = self._get_kinesis_shard_iterator(topic)
                while True:
                    response = self.kinesis_client.get_records(
                        ShardIterator=shard_iterator, Limit=100
                    )

                    for record in response["Records"]:
                        yield {
                            "key": record["PartitionKey"],
                            "value": json.loads(record["Data"]),
                            "timestamp": record["ApproximateArrivalTimestamp"],
                            "sequence_number": record["SequenceNumber"],
                        }

                    shard_iterator = response["NextShardIterator"]
                    await asyncio.sleep(1)

        except Exception as e:
            logger.error(f"Message consumption error from {topic}: {e}")

    def _get_kinesis_shard_iterator(self, stream_name: str) -> str:
        """Get Kinesis shard iterator"""
        response = self.kinesis_client.describe_stream(StreamName=stream_name)
        shard_id = response["StreamDescription"]["Shards"][0]["ShardId"]

        response = self.kinesis_client.get_shard_iterator(
            StreamName=stream_name, ShardId=shard_id, ShardIteratorType="LATEST"
        )
        return response["ShardIterator"]


# Global streaming manager instance
streaming = StreamingManager()


async def get_streaming() -> StreamingManager:
    """Dependency to get streaming manager"""
    return streaming


async def start_streaming() -> None:
    """Start streaming services"""
    await streaming.start()


async def stop_streaming() -> None:
    """Stop streaming services"""
    await streaming.stop()
