"""
Storage configuration for S3/MinIO
"""
import boto3
from botocore.config import Config
from config.settings import settings
import logging
from typing import Optional, BinaryIO
import io

logger = logging.getLogger(__name__)


class StorageManager:
    """Storage manager for S3/MinIO with local/production switching"""

    def __init__(self):
        self.client = self._create_client()
        self.bucket = settings.s3_bucket

    def _create_client(self):
        """Create S3 client (MinIO or AWS S3)"""
        config = Config(
            region_name=settings.aws_region,
            retries={"max_attempts": 3, "mode": "adaptive"},
        )

        if settings.use_local_storage:
            # Use MinIO
            return boto3.client(
                "s3",
                endpoint_url=settings.storage_endpoint,
                aws_access_key_id=settings.s3_access_key,
                aws_secret_access_key=settings.s3_secret_key,
                config=config,
            )
        else:
            # Use AWS S3
            return boto3.client("s3", region_name=settings.aws_region, config=config)

    async def upload_file(
        self, file_obj: BinaryIO, key: str, content_type: Optional[str] = None
    ) -> bool:
        """Upload file to storage"""
        try:
            extra_args = {}
            if content_type:
                extra_args["ContentType"] = content_type

            self.client.upload_fileobj(file_obj, self.bucket, key, ExtraArgs=extra_args)
            logger.info(f"File uploaded successfully: {key}")
            return True
        except Exception as e:
            logger.error(f"File upload error for {key}: {e}")
            return False

    async def download_file(self, key: str) -> Optional[bytes]:
        """Download file from storage"""
        try:
            response = self.client.get_object(Bucket=self.bucket, Key=key)
            return response["Body"].read()
        except Exception as e:
            logger.error(f"File download error for {key}: {e}")
            return None

    async def delete_file(self, key: str) -> bool:
        """Delete file from storage"""
        try:
            self.client.delete_object(Bucket=self.bucket, Key=key)
            logger.info(f"File deleted successfully: {key}")
            return True
        except Exception as e:
            logger.error(f"File delete error for {key}: {e}")
            return False

    async def file_exists(self, key: str) -> bool:
        """Check if file exists in storage"""
        try:
            self.client.head_object(Bucket=self.bucket, Key=key)
            return True
        except Exception as e:
            if e.response["Error"]["Code"] == "404":
                return False
            logger.error(f"File exists check error for {key}: {e}")
            return False

    async def get_file_url(self, key: str, expires_in: int = 3600) -> Optional[str]:
        """Get presigned URL for file access"""
        try:
            url = self.client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket, "Key": key},
                ExpiresIn=expires_in,
            )
            return url
        except Exception as e:
            logger.error(f"Presigned URL generation error for {key}: {e}")
            return None

    async def list_files(self, prefix: str = "") -> list[str]:
        """List files with prefix"""
        try:
            response = self.client.list_objects_v2(Bucket=self.bucket, Prefix=prefix)
            return [obj["Key"] for obj in response.get("Contents", [])]
        except Exception as e:
            logger.error(f"File list error for prefix {prefix}: {e}")
            return []


# Global storage manager instance
storage = StorageManager()


async def get_storage() -> StorageManager:
    """Dependency to get storage manager"""
    return storage
