"""
Check-in/Check-out database models
"""
from sqlalchemy import Column, String, UUID, DateTime, Float, Text, Index
from sqlalchemy import JSON
from modules.shared.database.base import Base, TimestampMixin
import uuid


class CheckInOutRecord(Base, TimestampMixin):
    """Check-in/check-out record model"""
    __tablename__ = "checkin_checkout_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    asset_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    user_name = Column(String, nullable=False)
    
    # Check-in information
    check_in_time = Column(DateTime(timezone=True), nullable=False, index=True)
    check_in_location_lat = Column(Float, nullable=True)
    check_in_location_lng = Column(Float, nullable=True)
    check_in_location_description = Column(String, nullable=True)
    
    # Check-out information
    check_out_time = Column(DateTime(timezone=True), nullable=True, index=True)
    check_out_location_lat = Column(Float, nullable=True)
    check_out_location_lng = Column(Float, nullable=True)
    check_out_location_description = Column(String, nullable=True)
    
    # Purpose and duration
    purpose = Column(String, nullable=True)
    expected_duration_hours = Column(Float, nullable=True)
    actual_duration_hours = Column(Float, nullable=True)
    
    # Notes and condition
    notes = Column(Text, nullable=True)
    condition_notes = Column(Text, nullable=True)
    return_notes = Column(Text, nullable=True)
    
    # Additional metadata
    checkout_metadata = Column(JSON, default={})

    __table_args__ = (
        Index('idx_checkin_asset_time', 'asset_id', 'check_in_time'),
        Index('idx_checkin_user_time', 'user_id', 'check_in_time'),
        Index('idx_checkin_org_time', 'organization_id', 'check_in_time'),
    )
