"""
User schemas
"""

from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, validator


class UserBase(BaseModel):
    """Base user schema"""

    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=100, description="Username")
    full_name: str = Field(..., min_length=1, max_length=255, description="Full name")
    role: str = Field(default="user", description="User role")
    is_active: bool = Field(default=True, description="Whether user is active")
    preferences: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="User preferences"
    )

    @validator("role")
    def validate_role(cls, v):
        allowed_roles = ["user", "admin", "superuser", "technician", "manager"]
        if v not in allowed_roles:
            raise ValueError(f'Role must be one of: {", ".join(allowed_roles)}')
        return v


class UserCreate(UserBase):
    """Schema for creating a new user"""

    password: str = Field(..., min_length=8, description="User password")

    @validator("password")
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class UserUpdate(BaseModel):
    """Schema for updating a user"""

    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[str] = None
    is_active: Optional[bool] = None
    preferences: Optional[Dict[str, Any]] = None

    @validator("role")
    def validate_role(cls, v):
        if v is not None:
            allowed_roles = ["user", "admin", "superuser", "technician", "manager"]
            if v not in allowed_roles:
                raise ValueError(f'Role must be one of: {", ".join(allowed_roles)}')
        return v


class UserResponse(UserBase):
    """Schema for user response"""

    id: UUID
    organization_id: UUID
    is_superuser: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile (self-update)"""

    full_name: Optional[str] = Field(None, min_length=1, max_length=255)
    preferences: Optional[Dict[str, Any]] = None


class UserPasswordUpdate(BaseModel):
    """Schema for updating user password"""

    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")

    @validator("new_password")
    def validate_new_password(cls, v):
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters long")
        return v


class LoginRequest(BaseModel):
    """Schema for login request"""

    username: str = Field(..., description="Username or email")
    password: str = Field(..., description="Password")


class LoginResponse(BaseModel):
    """Schema for login response"""

    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class TokenRefreshRequest(BaseModel):
    """Schema for token refresh request"""

    refresh_token: str = Field(..., description="Refresh token")


class TokenRefreshResponse(BaseModel):
    """Schema for token refresh response"""

    access_token: str
    token_type: str = "bearer"
    expires_in: int


class UserStats(BaseModel):
    """Schema for user statistics"""

    total_users: int
    active_users: int
    inactive_users: int
    admin_users: int
    technician_users: int
    manager_users: int
    regular_users: int
