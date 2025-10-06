"""
Elasticsearch configuration and client management
"""
import json
import logging
from typing import Any, Dict, List, Optional

from elasticsearch import AsyncElasticsearch
from elasticsearch.exceptions import ConnectionError, NotFoundError

from config.settings import settings

logger = logging.getLogger(__name__)


class ElasticsearchManager:
    """Elasticsearch client manager"""

    def __init__(self):
        self.client = None
        self.indices = {
            "assets": "assets_index",
            "sites": "sites_index",
            "gateways": "gateways_index",
            "alerts": "alerts_index",
            "audit_logs": "audit_logs_index",
        }

    async def _get_client(self) -> AsyncElasticsearch:
        """Get Elasticsearch client"""
        if not self.client:
            self.client = AsyncElasticsearch(
                hosts=[settings.elasticsearch_url],
                timeout=30,
                max_retries=3,
                retry_on_timeout=True,
            )
        return self.client

    async def create_indices(self) -> bool:
        """Create all required indices"""
        try:
            client = await self._get_client()

            # Create assets index
            await self._create_assets_index(client)

            # Create sites index
            await self._create_sites_index(client)

            # Create gateways index
            await self._create_gateways_index(client)

            # Create alerts index
            await self._create_alerts_index(client)

            # Create audit logs index
            await self._create_audit_logs_index(client)

            logger.info("All Elasticsearch indices created successfully")
            return True

        except Exception as e:
            logger.error(f"Error creating Elasticsearch indices: {e}")
            return False

    async def _create_assets_index(self, client: AsyncElasticsearch):
        """Create assets index with mapping"""
        index_name = self.indices["assets"]

        mapping = {
            "mappings": {
                "properties": {
                    "id": {"type": "keyword"},
                    "name": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {"keyword": {"type": "keyword"}},
                    },
                    "serial_number": {"type": "keyword"},
                    "asset_type": {"type": "keyword"},
                    "status": {"type": "keyword"},
                    "manufacturer": {
                        "type": "text",
                        "fields": {"keyword": {"type": "keyword"}},
                    },
                    "model": {
                        "type": "text",
                        "fields": {"keyword": {"type": "keyword"}},
                    },
                    "location_description": {"type": "text"},
                    "current_site_id": {"type": "keyword"},
                    "assigned_to_user_id": {"type": "keyword"},
                    "battery_level": {"type": "integer"},
                    "temperature": {"type": "float"},
                    "purchase_date": {"type": "date"},
                    "warranty_expiry": {"type": "date"},
                    "hourly_rate": {"type": "float"},
                    "availability": {"type": "keyword"},
                    "metadata": {"type": "object", "dynamic": True},
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"},
                    "organization_id": {"type": "keyword"},
                }
            },
            "settings": {
                "number_of_shards": 1,
                "number_of_replicas": 0,
                "analysis": {
                    "analyzer": {
                        "asset_analyzer": {
                            "type": "custom",
                            "tokenizer": "standard",
                            "filter": ["lowercase", "stop"],
                        }
                    }
                },
            },
        }

        try:
            await client.indices.create(index=index_name, body=mapping)
            logger.info(f"Created assets index: {index_name}")
        except Exception as e:
            if "resource_already_exists_exception" not in str(e):
                logger.error(f"Error creating assets index: {e}")

    async def _create_sites_index(self, client: AsyncElasticsearch):
        """Create sites index with mapping"""
        index_name = self.indices["sites"]

        mapping = {
            "mappings": {
                "properties": {
                    "id": {"type": "keyword"},
                    "name": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {"keyword": {"type": "keyword"}},
                    },
                    "location": {"type": "text"},
                    "area": {"type": "text"},
                    "status": {"type": "keyword"},
                    "manager": {"type": "text"},
                    "coordinates": {"type": "geo_point"},
                    "radius": {"type": "float"},
                    "tolerance": {"type": "float"},
                    "address": {"type": "text"},
                    "phone": {"type": "keyword"},
                    "email": {"type": "keyword"},
                    "description": {"type": "text"},
                    "geofence_id": {"type": "keyword"},
                    "asset_count": {"type": "integer"},
                    "personnel_count": {"type": "integer"},
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"},
                    "organization_id": {"type": "keyword"},
                }
            },
            "settings": {"number_of_shards": 1, "number_of_replicas": 0},
        }

        try:
            await client.indices.create(index=index_name, body=mapping)
            logger.info(f"Created sites index: {index_name}")
        except Exception as e:
            if "resource_already_exists_exception" not in str(e):
                logger.error(f"Error creating sites index: {e}")

    async def _create_gateways_index(self, client: AsyncElasticsearch):
        """Create gateways index with mapping"""
        index_name = self.indices["gateways"]

        mapping = {
            "mappings": {
                "properties": {
                    "id": {"type": "keyword"},
                    "gateway_id": {"type": "keyword"},
                    "name": {
                        "type": "text",
                        "analyzer": "standard",
                        "fields": {"keyword": {"type": "keyword"}},
                    },
                    "location_description": {"type": "text"},
                    "latitude": {"type": "float"},
                    "longitude": {"type": "float"},
                    "altitude": {"type": "float"},
                    "status": {"type": "keyword"},
                    "firmware_version": {"type": "keyword"},
                    "last_seen": {"type": "date"},
                    "signal_strength": {"type": "integer"},
                    "battery_level": {"type": "integer"},
                    "temperature": {"type": "float"},
                    "site_id": {"type": "keyword"},
                    "metadata": {"type": "object", "dynamic": True},
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"},
                    "organization_id": {"type": "keyword"},
                }
            },
            "settings": {"number_of_shards": 1, "number_of_replicas": 0},
        }

        try:
            await client.indices.create(index=index_name, body=mapping)
            logger.info(f"Created gateways index: {index_name}")
        except Exception as e:
            if "resource_already_exists_exception" not in str(e):
                logger.error(f"Error creating gateways index: {e}")

    async def _create_alerts_index(self, client: AsyncElasticsearch):
        """Create alerts index with mapping"""
        index_name = self.indices["alerts"]

        mapping = {
            "mappings": {
                "properties": {
                    "id": {"type": "keyword"},
                    "alert_type": {"type": "keyword"},
                    "severity": {"type": "keyword"},
                    "status": {"type": "keyword"},
                    "asset_id": {"type": "keyword"},
                    "asset_name": {"type": "text"},
                    "message": {"type": "text"},
                    "description": {"type": "text"},
                    "reason": {"type": "text"},
                    "suggested_action": {"type": "text"},
                    "location_description": {"type": "text"},
                    "latitude": {"type": "float"},
                    "longitude": {"type": "float"},
                    "geofence_id": {"type": "keyword"},
                    "geofence_name": {"type": "text"},
                    "triggered_at": {"type": "date"},
                    "acknowledged_at": {"type": "date"},
                    "resolved_at": {"type": "date"},
                    "resolution_notes": {"type": "text"},
                    "resolved_by_user_id": {"type": "keyword"},
                    "auto_resolvable": {"type": "boolean"},
                    "created_at": {"type": "date"},
                    "updated_at": {"type": "date"},
                    "organization_id": {"type": "keyword"},
                }
            },
            "settings": {"number_of_shards": 1, "number_of_replicas": 0},
        }

        try:
            await client.indices.create(index=index_name, body=mapping)
            logger.info(f"Created alerts index: {index_name}")
        except Exception as e:
            if "resource_already_exists_exception" not in str(e):
                logger.error(f"Error creating alerts index: {e}")

    async def _create_audit_logs_index(self, client: AsyncElasticsearch):
        """Create audit logs index with mapping"""
        index_name = self.indices["audit_logs"]

        mapping = {
            "mappings": {
                "properties": {
                    "id": {"type": "keyword"},
                    "entity_type": {"type": "keyword"},
                    "entity_id": {"type": "keyword"},
                    "action": {"type": "keyword"},
                    "user_id": {"type": "keyword"},
                    "changes": {"type": "object", "dynamic": True},
                    "metadata": {"type": "object", "dynamic": True},
                    "created_at": {"type": "date"},
                    "organization_id": {"type": "keyword"},
                }
            },
            "settings": {"number_of_shards": 1, "number_of_replicas": 0},
        }

        try:
            await client.indices.create(index=index_name, body=mapping)
            logger.info(f"Created audit logs index: {index_name}")
        except Exception as e:
            if "resource_already_exists_exception" not in str(e):
                logger.error(f"Error creating audit logs index: {e}")

    async def index_document(
        self, index_type: str, document_id: str, document: Dict[str, Any]
    ) -> bool:
        """Index a document"""
        try:
            client = await self._get_client()
            index_name = self.indices.get(index_type)

            if not index_name:
                logger.error(f"Unknown index type: {index_type}")
                return False

            await client.index(index=index_name, id=document_id, body=document)

            logger.debug(f"Indexed document {document_id} in {index_name}")
            return True

        except Exception as e:
            logger.error(f"Error indexing document {document_id}: {e}")
            return False

    async def search_documents(
        self, index_type: str, query: Dict[str, Any], size: int = 10, from_: int = 0
    ) -> Dict[str, Any]:
        """Search documents"""
        try:
            client = await self._get_client()
            index_name = self.indices.get(index_type)

            if not index_name:
                raise ValueError(f"Unknown index type: {index_type}")

            response = await client.search(
                index=index_name, body=query, size=size, from_=from_
            )

            return response

        except Exception as e:
            logger.error(f"Error searching {index_type}: {e}")
            return {"hits": {"total": {"value": 0}, "hits": []}}

    async def delete_document(self, index_type: str, document_id: str) -> bool:
        """Delete a document"""
        try:
            client = await self._get_client()
            index_name = self.indices.get(index_type)

            if not index_name:
                logger.error(f"Unknown index type: {index_type}")
                return False

            await client.delete(index=index_name, id=document_id)
            logger.debug(f"Deleted document {document_id} from {index_name}")
            return True

        except NotFoundError:
            logger.debug(f"Document {document_id} not found in {index_name}")
            return True
        except Exception as e:
            logger.error(f"Error deleting document {document_id}: {e}")
            return False

    async def update_document(
        self, index_type: str, document_id: str, document: Dict[str, Any]
    ) -> bool:
        """Update a document"""
        try:
            client = await self._get_client()
            index_name = self.indices.get(index_type)

            if not index_name:
                logger.error(f"Unknown index type: {index_type}")
                return False

            await client.index(index=index_name, id=document_id, body=document)

            logger.debug(f"Updated document {document_id} in {index_name}")
            return True

        except Exception as e:
            logger.error(f"Error updating document {document_id}: {e}")
            return False

    async def get_index_stats(self) -> Dict[str, Any]:
        """Get index statistics"""
        try:
            client = await self._get_client()
            stats = {}

            for index_type, index_name in self.indices.items():
                try:
                    index_stats = await client.indices.stats(index=index_name)
                    stats[index_type] = {
                        "doc_count": index_stats["indices"][index_name]["total"][
                            "docs"
                        ]["count"],
                        "size": index_stats["indices"][index_name]["total"]["store"][
                            "size_in_bytes"
                        ],
                    }
                except NotFoundError:
                    stats[index_type] = {"doc_count": 0, "size": 0}

            return stats

        except Exception as e:
            logger.error(f"Error getting index stats: {e}")
            return {}

    async def health_check(self) -> Dict[str, Any]:
        """Check Elasticsearch health"""
        try:
            client = await self._get_client()
            health = await client.cluster.health()

            return {
                "status": health["status"],
                "number_of_nodes": health["number_of_nodes"],
                "active_shards": health["active_shards"],
                "relocating_shards": health["relocating_shards"],
                "initializing_shards": health["initializing_shards"],
                "unassigned_shards": health["unassigned_shards"],
            }

        except Exception as e:
            logger.error(f"Error checking Elasticsearch health: {e}")
            return {"status": "red", "error": str(e)}

    async def close(self):
        """Close Elasticsearch client"""
        if self.client:
            await self.client.close()
            logger.info("Elasticsearch client closed")


# Global Elasticsearch manager instance
elasticsearch_manager = ElasticsearchManager()


async def get_elasticsearch_manager() -> ElasticsearchManager:
    """Get Elasticsearch manager instance"""
    return elasticsearch_manager


async def close_elasticsearch():
    """Close Elasticsearch connections"""
    await elasticsearch_manager.close()
