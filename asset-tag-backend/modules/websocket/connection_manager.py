"""
WebSocket connection manager for handling real-time connections
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Any, Dict, List, Optional, Set

from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class ConnectionManager:
    """Manages WebSocket connections and message broadcasting"""

    def __init__(self):
        # Active connections by connection type
        self.active_connections: Dict[str, Set[WebSocket]] = {
            "locations": set(),
            "alerts": set(),
            "geofences": set(),
            "dashboard": set(),
        }

        # Connection metadata
        self.connection_metadata: Dict[WebSocket, Dict[str, Any]] = {}

        # Subscription filters for each connection
        self.connection_filters: Dict[WebSocket, Dict[str, Any]] = {}

    async def connect(
        self,
        websocket: WebSocket,
        connection_type: str,
        filters: Optional[Dict[str, Any]] = None,
    ):
        """Accept a WebSocket connection and add it to the appropriate group"""
        await websocket.accept()

        if connection_type not in self.active_connections:
            raise ValueError(f"Invalid connection type: {connection_type}")

        self.active_connections[connection_type].add(websocket)
        self.connection_metadata[websocket] = {
            "type": connection_type,
            "connected_at": datetime.now(),
            "last_activity": datetime.now(),
        }
        self.connection_filters[websocket] = filters or {}

        logger.info(
            f"WebSocket connected: {connection_type} (total: {len(self.active_connections[connection_type])})"
        )

        # Send welcome message
        await self.send_personal_message(
            {
                "type": "connection_established",
                "connection_type": connection_type,
                "timestamp": datetime.now().isoformat(),
                "message": "Connected to real-time updates",
            },
            websocket,
        )

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection from all groups"""
        connection_type = None

        # Find and remove from appropriate group
        for conn_type, connections in self.active_connections.items():
            if websocket in connections:
                connections.remove(websocket)
                connection_type = conn_type
                break

        # Clean up metadata
        if websocket in self.connection_metadata:
            del self.connection_metadata[websocket]
        if websocket in self.connection_filters:
            del self.connection_filters[websocket]

        if connection_type:
            logger.info(
                f"WebSocket disconnected: {connection_type} (total: {len(self.active_connections[connection_type])})"
            )

    async def send_personal_message(
        self, message: Dict[str, Any], websocket: WebSocket
    ):
        """Send a message to a specific WebSocket connection"""
        try:
            await websocket.send_text(json.dumps(message))
            if websocket in self.connection_metadata:
                self.connection_metadata[websocket]["last_activity"] = datetime.now()
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)

    async def broadcast_to_type(self, message: Dict[str, Any], connection_type: str):
        """Broadcast a message to all connections of a specific type"""
        if connection_type not in self.active_connections:
            return

        disconnected = set()

        for websocket in self.active_connections[connection_type]:
            try:
                # Check if message matches connection filters
                if self._message_matches_filters(message, websocket):
                    await websocket.send_text(json.dumps(message))
                    if websocket in self.connection_metadata:
                        self.connection_metadata[websocket][
                            "last_activity"
                        ] = datetime.now()
            except Exception as e:
                logger.error(f"Error broadcasting to {connection_type}: {e}")
                disconnected.add(websocket)

        # Remove disconnected connections
        for websocket in disconnected:
            self.disconnect(websocket)

    async def broadcast_to_all(self, message: Dict[str, Any]):
        """Broadcast a message to all active connections"""
        for connection_type in self.active_connections:
            await self.broadcast_to_type(message, connection_type)

    def _message_matches_filters(
        self, message: Dict[str, Any], websocket: WebSocket
    ) -> bool:
        """Check if a message matches the filters for a specific connection"""
        if websocket not in self.connection_filters:
            return True

        filters = self.connection_filters[websocket]

        # Check asset filters
        if "asset_ids" in filters and message.get("asset_id"):
            if message["asset_id"] not in filters["asset_ids"]:
                return False

        # Check site filters
        if "site_ids" in filters and message.get("site_id"):
            if message["site_id"] not in filters["site_ids"]:
                return False

        # Check alert type filters
        if "alert_types" in filters and message.get("alert_type"):
            if message["alert_type"] not in filters["alert_types"]:
                return False

        # Check severity filters
        if "severity_levels" in filters and message.get("severity"):
            if message["severity"] not in filters["severity_levels"]:
                return False

        # Check geofence filters
        if "geofence_ids" in filters and message.get("geofence_id"):
            if message["geofence_id"] not in filters["geofence_ids"]:
                return False

        return True

    def get_connection_stats(self) -> Dict[str, Any]:
        """Get statistics about active connections"""
        stats = {
            "total_connections": sum(
                len(connections) for connections in self.active_connections.values()
            ),
            "connections_by_type": {
                conn_type: len(connections)
                for conn_type, connections in self.active_connections.items()
            },
            "connection_details": [],
        }

        for websocket, metadata in self.connection_metadata.items():
            stats["connection_details"].append(
                {
                    "type": metadata["type"],
                    "connected_at": metadata["connected_at"].isoformat(),
                    "last_activity": metadata["last_activity"].isoformat(),
                    "filters": self.connection_filters.get(websocket, {}),
                }
            )

        return stats

    async def handle_client_message(self, websocket: WebSocket, message: str):
        """Handle incoming messages from clients"""
        try:
            data = json.loads(message)
            message_type = data.get("type")

            if message_type == "ping":
                # Respond to ping with pong
                await self.send_personal_message(
                    {"type": "pong", "timestamp": datetime.now().isoformat()}, websocket
                )

            elif message_type == "update_filters":
                # Update connection filters
                if websocket in self.connection_filters:
                    self.connection_filters[websocket].update(data.get("filters", {}))
                    await self.send_personal_message(
                        {
                            "type": "filters_updated",
                            "filters": self.connection_filters[websocket],
                            "timestamp": datetime.now().isoformat(),
                        },
                        websocket,
                    )

            elif message_type == "subscribe":
                # Handle subscription requests
                subscription_type = data.get("subscription_type")
                filters = data.get("filters", {})

                if websocket in self.connection_filters:
                    self.connection_filters[websocket].update(filters)

                await self.send_personal_message(
                    {
                        "type": "subscribed",
                        "subscription_type": subscription_type,
                        "filters": filters,
                        "timestamp": datetime.now().isoformat(),
                    },
                    websocket,
                )

            else:
                # Unknown message type
                await self.send_personal_message(
                    {
                        "type": "error",
                        "message": f"Unknown message type: {message_type}",
                        "timestamp": datetime.now().isoformat(),
                    },
                    websocket,
                )

        except json.JSONDecodeError:
            await self.send_personal_message(
                {
                    "type": "error",
                    "message": "Invalid JSON format",
                    "timestamp": datetime.now().isoformat(),
                },
                websocket,
            )
        except Exception as e:
            logger.error(f"Error handling client message: {e}")
            await self.send_personal_message(
                {
                    "type": "error",
                    "message": "Internal server error",
                    "timestamp": datetime.now().isoformat(),
                },
                websocket,
            )


# Global connection manager instance
manager = ConnectionManager()
