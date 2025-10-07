"""
Configuration settings for Asset Tag Backend
Supports local development with free alternatives and production AWS services
"""

from enum import Enum
from typing import Optional

from pydantic_settings import BaseSettings


class Environment(str, Enum):
    LOCAL = "local"
    STAGING = "staging"
    PRODUCTION = "production"
    TEST = "test"


class Settings(BaseSettings):
    # Environment
    environment: Environment = Environment.LOCAL

    # Database (PostgreSQL with TimescaleDB)
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    postgres_db: str = "asset_tag"
    postgres_user: str = "dev_user"
    postgres_password: str = "dev_pass"
    database_url_override: Optional[str] = None

    # Redis Cache
    redis_url: str = "redis://localhost:6379"
    use_redis: bool = False  # Disable Redis for now

    # Streaming (Kinesis/Redpanda)
    kinesis_stream_name: str = "bluetooth-observations"
    aws_region: str = "us-east-1"
    use_local_streaming: bool = False  # Use Redpanda instead of Kinesis
    enable_streaming: bool = False  # Completely disable streaming
    redpanda_brokers: str = "localhost:9092"

    # Storage (S3/MinIO)
    s3_endpoint_url: Optional[str] = "http://localhost:9000"
    s3_access_key: str = "minioadmin"
    s3_secret_key: str = "minioadmin"
    s3_bucket: str = "asset-tag-data"
    use_local_storage: bool = False  # Use MinIO instead of S3

    # Authentication
    secret_key: str = "change-me-in-production-secret-key-very-long-and-secure"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # API Configuration
    api_v1_prefix: str = "/api/v1"
    cors_origins: list = ["http://localhost:5173", "http://localhost:3000"]

    # Monitoring
    prometheus_port: int = 9090
    grafana_port: int = 3001
    use_local_monitoring: bool = True  # Use local Prometheus/Grafana

    # ML
    mlflow_tracking_uri: str = "http://localhost:5000"
    use_local_mlflow: bool = False  # Use local MLFlow

    # Elasticsearch
    elasticsearch_url: str = "http://localhost:9200"
    use_local_elasticsearch: bool = False  # Use local Elasticsearch

    # Logging
    log_level: str = "INFO"
    use_structured_logging: bool = True

    # Location Estimation
    location_estimation_window_minutes: int = 1
    min_gateways_for_trilateration: int = 3
    rssi_path_loss_exponent: float = 2.0
    rssi_reference_distance: float = 1.0  # meters
    rssi_reference_power: float = -45.0  # dBm at 1 meter

    # Alert Configuration
    battery_low_threshold: int = 20  # percentage
    offline_threshold_minutes: int = 30
    geofence_cache_ttl_seconds: int = 3600

    # Performance
    max_concurrent_requests: int = 100
    request_timeout_seconds: int = 30

    @property
    def database_url(self) -> str:
        """Get database URL for SQLAlchemy"""
        if self.database_url_override:
            return self.database_url_override
        # Use PostgreSQL for all environments including test (SQLite doesn't support UUID types)
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    @property
    def sync_database_url(self) -> str:
        """Get synchronous database URL for Alembic"""
        return f"postgresql://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    @property
    def storage_endpoint(self) -> Optional[str]:
        """Get storage endpoint (MinIO or S3)"""
        if self.use_local_storage:
            return self.s3_endpoint_url
        return None

    @property
    def streaming_brokers(self) -> str:
        """Get streaming brokers (Redpanda or Kinesis)"""
        if self.use_local_streaming:
            return self.redpanda_brokers
        return f"kinesis.{self.aws_region}.amazonaws.com"

    class Config:
        env_file = ".env"
        env_prefix = "ASSET_TAG_"
        case_sensitive = False


# Global settings instance
settings = Settings()
