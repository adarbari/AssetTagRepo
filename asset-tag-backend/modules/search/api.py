"""
Search API endpoints using Elasticsearch
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from config.cache import get_cache
from config.elasticsearch import (ElasticsearchManager,
                                  get_elasticsearch_manager)

router = APIRouter()


@router.get("/search/assets")
async def search_assets(
    q: str = Query(..., description="Search query"),
    asset_type: Optional[str] = Query(None, description="Filter by asset type"),
    status: Optional[str] = Query(None, description="Filter by status"),
    site_id: Optional[str] = Query(None, description="Filter by site ID"),
    manufacturer: Optional[str] = Query(None, description="Filter by manufacturer"),
    size: int = Query(10, ge=1, le=100, description="Number of results to return"),
    from_: int = Query(0, ge=0, description="Starting offset"),
    es_manager: ElasticsearchManager = Depends(get_elasticsearch_manager),
):
    """Search assets using Elasticsearch"""
    try:
        # Build Elasticsearch query
        query = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": q,
                                "fields": [
                                    "name^2",
                                    "serial_number^2",
                                    "manufacturer",
                                    "model",
                                    "location_description",
                                ],
                                "type": "best_fields",
                                "fuzziness": "AUTO",
                            }
                        }
                    ],
                    "filter": [],
                }
            },
            "highlight": {
                "fields": {
                    "name": {},
                    "serial_number": {},
                    "manufacturer": {},
                    "model": {},
                }
            },
            "sort": [{"_score": {"order": "desc"}}, {"name.keyword": {"order": "asc"}}],
        }

        # Add filters
        if asset_type:
            query["query"]["bool"]["filter"].append(
                {"term": {"asset_type": asset_type}}
            )

        if status:
            query["query"]["bool"]["filter"].append({"term": {"status": status}})

        if site_id:
            query["query"]["bool"]["filter"].append(
                {"term": {"current_site_id": site_id}}
            )

        if manufacturer:
            query["query"]["bool"]["filter"].append(
                {"term": {"manufacturer.keyword": manufacturer}}
            )

        # Execute search
        response = await es_manager.search_documents("assets", query, size, from_)

        # Process results
        hits = response.get("hits", {})
        total = hits.get("total", {}).get("value", 0)

        results = []
        for hit in hits.get("hits", []):
            source = hit["_source"]
            highlight = hit.get("highlight", {})

            result = {
                "id": source.get("id"),
                "name": source.get("name"),
                "serial_number": source.get("serial_number"),
                "asset_type": source.get("asset_type"),
                "status": source.get("status"),
                "manufacturer": source.get("manufacturer"),
                "model": source.get("model"),
                "location_description": source.get("location_description"),
                "battery_level": source.get("battery_level"),
                "temperature": source.get("temperature"),
                "score": hit["_score"],
                "highlight": highlight,
            }
            results.append(result)

        return {
            "query": q,
            "total": total,
            "size": size,
            "from": from_,
            "results": results,
            "filters": {
                "asset_type": asset_type,
                "status": status,
                "site_id": site_id,
                "manufacturer": manufacturer,
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching assets: {str(e)}")


@router.get("/search/sites")
async def search_sites(
    q: str = Query(..., description="Search query"),
    status: Optional[str] = Query(None, description="Filter by status"),
    size: int = Query(10, ge=1, le=100, description="Number of results to return"),
    from_: int = Query(0, ge=0, description="Starting offset"),
    es_manager: ElasticsearchManager = Depends(get_elasticsearch_manager),
):
    """Search sites using Elasticsearch"""
    try:
        # Build Elasticsearch query
        query = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": q,
                                "fields": [
                                    "name^2",
                                    "location^2",
                                    "address",
                                    "description",
                                ],
                                "type": "best_fields",
                                "fuzziness": "AUTO",
                            }
                        }
                    ],
                    "filter": [],
                }
            },
            "highlight": {"fields": {"name": {}, "location": {}, "address": {}}},
            "sort": [{"_score": {"order": "desc"}}, {"name.keyword": {"order": "asc"}}],
        }

        # Add filters
        if status:
            query["query"]["bool"]["filter"].append({"term": {"status": status}})

        # Execute search
        response = await es_manager.search_documents("sites", query, size, from_)

        # Process results
        hits = response.get("hits", {})
        total = hits.get("total", {}).get("value", 0)

        results = []
        for hit in hits.get("hits", []):
            source = hit["_source"]
            highlight = hit.get("highlight", {})

            result = {
                "id": source.get("id"),
                "name": source.get("name"),
                "location": source.get("location"),
                "area": source.get("area"),
                "status": source.get("status"),
                "manager": source.get("manager"),
                "address": source.get("address"),
                "asset_count": source.get("asset_count"),
                "personnel_count": source.get("personnel_count"),
                "score": hit["_score"],
                "highlight": highlight,
            }
            results.append(result)

        return {
            "query": q,
            "total": total,
            "size": size,
            "from": from_,
            "results": results,
            "filters": {"status": status},
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching sites: {str(e)}")


@router.get("/search/gateways")
async def search_gateways(
    q: str = Query(..., description="Search query"),
    status: Optional[str] = Query(None, description="Filter by status"),
    site_id: Optional[str] = Query(None, description="Filter by site ID"),
    size: int = Query(10, ge=1, le=100, description="Number of results to return"),
    from_: int = Query(0, ge=0, description="Starting offset"),
    es_manager: ElasticsearchManager = Depends(get_elasticsearch_manager),
):
    """Search gateways using Elasticsearch"""
    try:
        # Build Elasticsearch query
        query = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": q,
                                "fields": [
                                    "name^2",
                                    "gateway_id^2",
                                    "location_description",
                                ],
                                "type": "best_fields",
                                "fuzziness": "AUTO",
                            }
                        }
                    ],
                    "filter": [],
                }
            },
            "highlight": {
                "fields": {"name": {}, "gateway_id": {}, "location_description": {}}
            },
            "sort": [{"_score": {"order": "desc"}}, {"name.keyword": {"order": "asc"}}],
        }

        # Add filters
        if status:
            query["query"]["bool"]["filter"].append({"term": {"status": status}})

        if site_id:
            query["query"]["bool"]["filter"].append({"term": {"site_id": site_id}})

        # Execute search
        response = await es_manager.search_documents("gateways", query, size, from_)

        # Process results
        hits = response.get("hits", {})
        total = hits.get("total", {}).get("value", 0)

        results = []
        for hit in hits.get("hits", []):
            source = hit["_source"]
            highlight = hit.get("highlight", {})

            result = {
                "id": source.get("id"),
                "gateway_id": source.get("gateway_id"),
                "name": source.get("name"),
                "location_description": source.get("location_description"),
                "latitude": source.get("latitude"),
                "longitude": source.get("longitude"),
                "status": source.get("status"),
                "firmware_version": source.get("firmware_version"),
                "last_seen": source.get("last_seen"),
                "signal_strength": source.get("signal_strength"),
                "battery_level": source.get("battery_level"),
                "temperature": source.get("temperature"),
                "site_id": source.get("site_id"),
                "score": hit["_score"],
                "highlight": highlight,
            }
            results.append(result)

        return {
            "query": q,
            "total": total,
            "size": size,
            "from": from_,
            "results": results,
            "filters": {"status": status, "site_id": site_id},
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error searching gateways: {str(e)}"
        )


@router.get("/search/alerts")
async def search_alerts(
    q: str = Query(..., description="Search query"),
    alert_type: Optional[str] = Query(None, description="Filter by alert type"),
    severity: Optional[str] = Query(None, description="Filter by severity"),
    status: Optional[str] = Query(None, description="Filter by status"),
    asset_id: Optional[str] = Query(None, description="Filter by asset ID"),
    size: int = Query(10, ge=1, le=100, description="Number of results to return"),
    from_: int = Query(0, ge=0, description="Starting offset"),
    es_manager: ElasticsearchManager = Depends(get_elasticsearch_manager),
):
    """Search alerts using Elasticsearch"""
    try:
        # Build Elasticsearch query
        query = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": q,
                                "fields": [
                                    "message^2",
                                    "description^2",
                                    "asset_name",
                                    "reason",
                                ],
                                "type": "best_fields",
                                "fuzziness": "AUTO",
                            }
                        }
                    ],
                    "filter": [],
                }
            },
            "highlight": {
                "fields": {"message": {}, "description": {}, "asset_name": {}}
            },
            "sort": [
                {"triggered_at": {"order": "desc"}},
                {"_score": {"order": "desc"}},
            ],
        }

        # Add filters
        if alert_type:
            query["query"]["bool"]["filter"].append(
                {"term": {"alert_type": alert_type}}
            )

        if severity:
            query["query"]["bool"]["filter"].append({"term": {"severity": severity}})

        if status:
            query["query"]["bool"]["filter"].append({"term": {"status": status}})

        if asset_id:
            query["query"]["bool"]["filter"].append({"term": {"asset_id": asset_id}})

        # Execute search
        response = await es_manager.search_documents("alerts", query, size, from_)

        # Process results
        hits = response.get("hits", {})
        total = hits.get("total", {}).get("value", 0)

        results = []
        for hit in hits.get("hits", []):
            source = hit["_source"]
            highlight = hit.get("highlight", {})

            result = {
                "id": source.get("id"),
                "alert_type": source.get("alert_type"),
                "severity": source.get("severity"),
                "status": source.get("status"),
                "asset_id": source.get("asset_id"),
                "asset_name": source.get("asset_name"),
                "message": source.get("message"),
                "description": source.get("description"),
                "reason": source.get("reason"),
                "suggested_action": source.get("suggested_action"),
                "location_description": source.get("location_description"),
                "latitude": source.get("latitude"),
                "longitude": source.get("longitude"),
                "geofence_id": source.get("geofence_id"),
                "geofence_name": source.get("geofence_name"),
                "triggered_at": source.get("triggered_at"),
                "acknowledged_at": source.get("acknowledged_at"),
                "resolved_at": source.get("resolved_at"),
                "resolution_notes": source.get("resolution_notes"),
                "auto_resolvable": source.get("auto_resolvable"),
                "score": hit["_score"],
                "highlight": highlight,
            }
            results.append(result)

        return {
            "query": q,
            "total": total,
            "size": size,
            "from": from_,
            "results": results,
            "filters": {
                "alert_type": alert_type,
                "severity": severity,
                "status": status,
                "asset_id": asset_id,
            },
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching alerts: {str(e)}")


@router.get("/search/global")
async def global_search(
    q: str = Query(..., description="Search query"),
    entity_types: Optional[str] = Query(
        None, description="Comma-separated entity types (assets,sites,gateways,alerts)"
    ),
    size: int = Query(20, ge=1, le=100, description="Number of results to return"),
    es_manager: ElasticsearchManager = Depends(get_elasticsearch_manager),
):
    """Global search across all entity types"""
    try:
        # Parse entity types
        if entity_types:
            types = [t.strip() for t in entity_types.split(",")]
        else:
            types = ["assets", "sites", "gateways", "alerts"]

        results = {}
        total_results = 0

        # Search each entity type
        for entity_type in types:
            if entity_type == "assets":
                search_result = await search_assets(
                    q, size=size // len(types), es_manager=es_manager
                )
            elif entity_type == "sites":
                search_result = await search_sites(
                    q, size=size // len(types), es_manager=es_manager
                )
            elif entity_type == "gateways":
                search_result = await search_gateways(
                    q, size=size // len(types), es_manager=es_manager
                )
            elif entity_type == "alerts":
                search_result = await search_alerts(
                    q, size=size // len(types), es_manager=es_manager
                )
            else:
                continue

            results[entity_type] = {
                "total": search_result["total"],
                "results": search_result["results"],
            }
            total_results += search_result["total"]

        return {
            "query": q,
            "total_results": total_results,
            "entity_types": types,
            "results": results,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error in global search: {str(e)}")


@router.get("/search/suggestions")
async def get_search_suggestions(
    q: str = Query(..., description="Search query for suggestions"),
    entity_type: str = Query("assets", description="Entity type for suggestions"),
    size: int = Query(5, ge=1, le=20, description="Number of suggestions"),
    es_manager: ElasticsearchManager = Depends(get_elasticsearch_manager),
):
    """Get search suggestions"""
    try:
        # Build completion query
        query = {
            "suggest": {
                "suggestions": {
                    "prefix": q,
                    "completion": {"field": f"{entity_type}_suggest", "size": size},
                }
            }
        }

        # Execute search
        response = await es_manager.search_documents(entity_type, query, size)

        suggestions = []
        if "suggest" in response:
            for suggestion in response["suggest"]["suggestions"]:
                for option in suggestion.get("options", []):
                    suggestions.append(
                        {"text": option["text"], "score": option["_score"]}
                    )

        return {"query": q, "entity_type": entity_type, "suggestions": suggestions}

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting suggestions: {str(e)}"
        )


@router.get("/search/stats")
async def get_search_stats(
    es_manager: ElasticsearchManager = Depends(get_elasticsearch_manager),
):
    """Get search index statistics"""
    try:
        stats = await es_manager.get_index_stats()
        health = await es_manager.health_check()

        return {
            "index_stats": stats,
            "cluster_health": health,
            "timestamp": datetime.now().isoformat(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error getting search stats: {str(e)}"
        )
