"""
Geofence Pydantic schemas
"""

from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, validator


class GeofenceBase(BaseModel):
    """Base geofence schema"""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    geofence_type: str = Field(..., pattern="^(circular|polygon)$")
    status: Optional[str] = Field("active", max_length=50)

    # Geometric definition
    center_latitude: Optional[float] = Field(None, ge=-90, le=90)
    center_longitude: Optional[float] = Field(None, ge=-180, le=180)
    radius: Optional[int] = Field(None, ge=0)
    coordinates: Optional[List[List[float]]] = Field(
        None, description="Array of [lat, lng] pairs for polygon geofences"
    )

    # Site association
    site_id: Optional[str] = None
    site_name: Optional[str] = Field(None, max_length=255)

    # Alert configuration
    alert_on_entry: Optional[bool] = True
    alert_on_exit: Optional[bool] = True
    geofence_classification: Optional[str] = Field("authorized", max_length=50)

    # Tolerance and buffer
    tolerance: Optional[int] = Field(None, ge=0)

    # Vehicle-based geofencing
    location_mode: Optional[str] = Field("static", max_length=50)
    vehicle_id: Optional[str] = None
    vehicle_name: Optional[str] = Field(None, max_length=255)

    # Asset attachment
    asset_id: Optional[str] = None
    asset_name: Optional[str] = Field(None, max_length=255)
    attachment_type: Optional[str] = Field("site", max_length=50)

    # Expected assets
    expected_asset_ids: Optional[List[str]] = None

    # Metadata
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

    @validator("coordinates")
    @classmethod
    def validate_coordinates(cls, v, values):
        """Validate coordinates based on geofence type"""
        if v is not None and values.get("geofence_type") == "polygon":
            if len(v) < 3:
                raise ValueError(
                    "Polygon geofences must have at least 3 coordinate pairs"
                )
            for coord in v:
                if len(coord) != 2:
                    raise ValueError("Each coordinate must be [latitude, longitude]")
                if not (-90 <= coord[0] <= 90):
                    raise ValueError("Latitude must be between -90 and 90")
                if not (-180 <= coord[1] <= 180):
                    raise ValueError("Longitude must be between -180 and 180")
        return v

    @validator("center_latitude")
    @classmethod
    def validate_center_latitude(cls, v, values):
        """Validate center latitude for circular geofences"""
        if values.get("geofence_type") == "circular" and v is None:
            raise ValueError("Center latitude is required for circular geofences")
        return v

    @validator("center_longitude")
    @classmethod
    def validate_center_longitude(cls, v, values):
        """Validate center longitude for circular geofences"""
        if values.get("geofence_type") == "circular" and v is None:
            raise ValueError("Center longitude is required for circular geofences")
        return v

    @validator("radius")
    @classmethod
    def validate_radius(cls, v, values):
        """Validate radius for circular geofences"""
        if values.get("geofence_type") == "circular" and v is None:
            raise ValueError("Radius is required for circular geofences")
        return v


class GeofenceCreate(GeofenceBase):
    """Schema for creating a geofence"""

    pass


class GeofenceUpdate(BaseModel):
    """Schema for updating a geofence"""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = Field(None, max_length=50)
    center_latitude: Optional[float] = Field(None, ge=-90, le=90)
    center_longitude: Optional[float] = Field(None, ge=-180, le=180)
    radius: Optional[int] = Field(None, ge=0)
    coordinates: Optional[List[List[float]]] = None
    site_id: Optional[str] = None
    site_name: Optional[str] = Field(None, max_length=255)
    alert_on_entry: Optional[bool] = None
    alert_on_exit: Optional[bool] = None
    geofence_classification: Optional[str] = Field(None, max_length=50)
    tolerance: Optional[int] = Field(None, ge=0)
    location_mode: Optional[str] = Field(None, max_length=50)
    vehicle_id: Optional[str] = None
    vehicle_name: Optional[str] = Field(None, max_length=255)
    asset_id: Optional[str] = None
    asset_name: Optional[str] = Field(None, max_length=255)
    attachment_type: Optional[str] = Field(None, max_length=50)
    expected_asset_ids: Optional[List[str]] = None
    metadata: Optional[Dict[str, Any]] = None


class GeofenceResponse(GeofenceBase):
    """Schema for geofence response"""

    id: str
    organization_id: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class GeofenceEventBase(BaseModel):
    """Base geofence event schema"""

    geofence_id: str = Field(..., description="Geofence ID")
    asset_id: str = Field(..., description="Asset ID")
    event_type: str = Field(..., pattern="^(entry|exit)$")
    timestamp: str = Field(..., description="ISO timestamp")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    confidence: Optional[float] = Field(None, ge=0, le=100)
    distance_from_geofence: Optional[float] = Field(None, ge=0)


class GeofenceEventCreate(GeofenceEventBase):
    """Schema for creating a geofence event"""

    pass


class GeofenceEventResponse(GeofenceEventBase):
    """Schema for geofence event response"""

    id: str
    organization_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GeofenceEvaluationRequest(BaseModel):
    """Schema for geofence evaluation request"""

    asset_id: str = Field(..., description="Asset ID to evaluate")
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    timestamp: Optional[str] = Field(None, description="ISO timestamp")
    geofence_ids: Optional[List[str]] = Field(
        None, description="Specific geofences to evaluate"
    )


class GeofenceEvaluationResponse(BaseModel):
    """Schema for geofence evaluation response"""

    asset_id: str
    latitude: float
    longitude: float
    timestamp: str
    evaluations: List[Dict[str, Any]]
    triggered_events: List[Dict[str, Any]]


class GeofenceStatsResponse(BaseModel):
    """Schema for geofence statistics"""

    total_geofences: int
    active_geofences: int
    inactive_geofences: int
    circular_geofences: int
    polygon_geofences: int
    total_events_today: int
    entry_events_today: int
    exit_events_today: int
    most_active_geofences: List[Dict[str, Any]]
