"""
Audit middleware for automatic change tracking
"""
import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import Request, Response
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from starlette.middleware.base import BaseHTTPMiddleware

from config.database import get_db
from modules.shared.database.models import AuditLog

logger = logging.getLogger(__name__)


class AuditMiddleware(BaseHTTPMiddleware):
    """Middleware for automatic audit logging"""

    def __init__(self, app, exclude_paths: Optional[List[str]] = None):
        super().__init__(app)
        self.exclude_paths = exclude_paths or ["/health", "/docs", "/redoc", "/openapi.json", "/metrics"]

    async def dispatch(self, request: Request, call_next):
        """Process request and log audit information"""
        start_time = datetime.now()

        # Skip audit for excluded paths
        if any(request.url.path.startswith(path) for path in self.exclude_paths):
            return await call_next(request)

        # Get request information
        request_info = await self._extract_request_info(request)

        # Process request
        response = await call_next(request)

        # Log audit information
        await self._log_audit(request_info, response, start_time)

        return response

    async def _extract_request_info(self, request: Request) -> Dict[str, Any]:
        """Extract request information for audit logging"""
        try:
            # Get request body for POST/PUT/PATCH requests
            body = None
            if request.method in ["POST", "PUT", "PATCH"]:
                try:
                    body_bytes = await request.body()
                    if body_bytes:
                        body = body_bytes.decode("utf-8")
                except Exception as e:
                    logger.warning(f"Could not read request body: {e}")

            # Get user information from headers or JWT token
            user_id = request.headers.get("X-User-ID")
            organization_id = request.headers.get("X-Organization-ID")

            return {
                "method": request.method,
                "url": str(request.url),
                "path": request.url.path,
                "query_params": dict(request.query_params),
                "headers": dict(request.headers),
                "body": body,
                "user_id": user_id,
                "organization_id": organization_id,
                "client_ip": request.client.host if request.client else None,
                "user_agent": request.headers.get("user-agent"),
            }

        except Exception as e:
            logger.error(f"Error extracting request info: {e}")
            return {"error": str(e)}

    async def _log_audit(self, request_info: Dict[str, Any], response: Response, start_time: datetime):
        """Log audit information to database"""
        try:
            # Only log for write operations
            if request_info.get("method") not in ["POST", "PUT", "PATCH", "DELETE"]:
                return

            # Determine entity type and ID from path
            entity_type, entity_id = self._extract_entity_info(request_info["path"])

            if not entity_type:
                return

            # Get response information
            response_info = {
                "status_code": response.status_code,
                "headers": dict(response.headers),
                "processing_time_ms": (datetime.now() - start_time).total_seconds() * 1000,
            }

            # Create audit log entry
            audit_data = {
                "entity_type": entity_type,
                "entity_id": entity_id,
                "action": self._map_method_to_action(request_info["method"]),
                "user_id": request_info.get("user_id"),
                "organization_id": request_info.get("organization_id") or "00000000-0000-0000-0000-000000000000",
                "changes": {
                    "request": {
                        "method": request_info["method"],
                        "path": request_info["path"],
                        "query_params": request_info["query_params"],
                        "body": request_info.get("body"),
                    },
                    "response": response_info,
                },
                "metadata": {
                    "client_ip": request_info.get("client_ip"),
                    "user_agent": request_info.get("user_agent"),
                    "timestamp": start_time.isoformat(),
                },
            }

            # Store in database
            await self._store_audit_log(audit_data)

        except Exception as e:
            logger.error(f"Error logging audit: {e}")

    def _extract_entity_info(self, path: str) -> tuple[Optional[str], Optional[str]]:
        """Extract entity type and ID from URL path"""
        try:
            # Parse path like /api/v1/assets/{asset_id}
            path_parts = path.strip("/").split("/")

            if len(path_parts) >= 3 and path_parts[0] == "api" and path_parts[1] == "v1":
                entity_type = path_parts[2]

                # Try to extract ID from path
                entity_id = None
                if len(path_parts) > 3:
                    # Check if next part looks like an ID
                    potential_id = path_parts[3]
                    if self._looks_like_id(potential_id):
                        entity_id = potential_id

                return entity_type, entity_id

            return None, None

        except Exception as e:
            logger.error(f"Error extracting entity info from path {path}: {e}")
            return None, None

    def _looks_like_id(self, value: str) -> bool:
        """Check if a string looks like an ID"""
        # UUID pattern or numeric ID
        import re

        uuid_pattern = r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
        numeric_pattern = r"^\d+$"

        return bool(re.match(uuid_pattern, value, re.IGNORECASE) or re.match(numeric_pattern, value))

    def _map_method_to_action(self, method: str) -> str:
        """Map HTTP method to audit action"""
        mapping = {"POST": "create", "PUT": "update", "PATCH": "update", "DELETE": "delete"}
        return mapping.get(method, "unknown")

    async def _store_audit_log(self, audit_data: Dict[str, Any]):
        """Store audit log in database"""
        try:
            # Get database session
            async for db in get_db():
                audit_log = AuditLog(
                    entity_type=audit_data["entity_type"],
                    entity_id=audit_data["entity_id"],
                    action=audit_data["action"],
                    user_id=audit_data.get("user_id"),
                    organization_id=audit_data["organization_id"],
                    changes=audit_data["changes"],
                    metadata=audit_data["metadata"],
                )

                db.add(audit_log)
                await db.commit()
                break

        except Exception as e:
            logger.error(f"Error storing audit log: {e}")


class AuditLogger:
    """Utility class for manual audit logging"""

    @staticmethod
    async def log_entity_change(
        entity_type: str,
        entity_id: str,
        action: str,
        user_id: Optional[str] = None,
        organization_id: str = "00000000-0000-0000-0000-000000000000",
        before_data: Optional[Dict[str, Any]] = None,
        after_data: Optional[Dict[str, Any]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Log entity change manually"""
        try:
            changes = {}
            if before_data:
                changes["before"] = before_data
            if after_data:
                changes["after"] = after_data

            audit_data = {
                "entity_type": entity_type,
                "entity_id": entity_id,
                "action": action,
                "user_id": user_id,
                "organization_id": organization_id,
                "changes": changes,
                "metadata": metadata or {},
            }

            # Store in database
            async for db in get_db():
                audit_log = AuditLog(
                    entity_type=audit_data["entity_type"],
                    entity_id=audit_data["entity_id"],
                    action=audit_data["action"],
                    user_id=audit_data.get("user_id"),
                    organization_id=audit_data["organization_id"],
                    changes=audit_data["changes"],
                    metadata=audit_data["metadata"],
                )

                db.add(audit_log)
                await db.commit()
                break

        except Exception as e:
            logger.error(f"Error logging entity change: {e}")

    @staticmethod
    async def log_bulk_operation(
        entity_type: str,
        action: str,
        user_id: Optional[str] = None,
        organization_id: str = "00000000-0000-0000-0000-000000000000",
        affected_entities: List[str] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ):
        """Log bulk operations"""
        try:
            audit_data = {
                "entity_type": entity_type,
                "entity_id": None,  # Bulk operation
                "action": f"bulk_{action}",
                "user_id": user_id,
                "organization_id": organization_id,
                "changes": {
                    "affected_entities": affected_entities or [],
                    "entity_count": len(affected_entities) if affected_entities else 0,
                },
                "metadata": metadata or {},
            }

            # Store in database
            async for db in get_db():
                audit_log = AuditLog(
                    entity_type=audit_data["entity_type"],
                    entity_id=audit_data["entity_id"],
                    action=audit_data["action"],
                    user_id=audit_data.get("user_id"),
                    organization_id=audit_data["organization_id"],
                    changes=audit_data["changes"],
                    metadata=audit_data["metadata"],
                )

                db.add(audit_log)
                await db.commit()
                break

        except Exception as e:
            logger.error(f"Error logging bulk operation: {e}")


# Global audit logger instance
audit_logger = AuditLogger()


async def get_audit_logger() -> AuditLogger:
    """Get audit logger instance"""
    return audit_logger
