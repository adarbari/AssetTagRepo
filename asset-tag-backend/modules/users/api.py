"""
User API endpoints
"""
import uuid
from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import and_, delete, func, or_, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from config.database import get_db
from config.settings import settings
from modules.shared.database.models import User
from modules.users.schemas import (LoginRequest, LoginResponse,
                                   TokenRefreshRequest, TokenRefreshResponse,
                                   UserCreate, UserPasswordUpdate,
                                   UserProfileUpdate, UserResponse, UserStats,
                                   UserUpdate)

router = APIRouter()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.access_token_expire_minutes
        )
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, settings.secret_key, algorithm=settings.algorithm
    )
    return encoded_jwt


async def get_current_user(
    token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)
) -> User:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, settings.secret_key, algorithms=[settings.algorithm]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


@router.get("/users", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
):
    """Get list of users with optional filtering"""
    try:
        query = select(User).where(User.deleted_at.is_(None))

        # Apply filters
        if role:
            query = query.where(User.role == role)
        if is_active is not None:
            query = query.where(User.is_active == is_active)
        if search:
            search_filter = and_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
                User.username.ilike(f"%{search}%"),
            )
            query = query.where(search_filter)

        # Apply pagination
        query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)

        result = await db.execute(query)
        users = result.scalars().all()

        return [UserResponse.from_orm(user) for user in users]

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching users: {str(e)}")


@router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Get user by ID"""
    try:
        result = await db.execute(
            select(User).where(and_(User.id == user_id, User.deleted_at.is_(None)))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return UserResponse.from_orm(user)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}")


@router.post("/users", response_model=UserResponse)
async def create_user(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Create a new user (admin only)"""
    try:
        # Check if user already exists
        existing_email = await db.execute(
            select(User).where(User.email == user_data.email)
        )
        if existing_email.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already registered")

        existing_username = await db.execute(
            select(User).where(User.username == user_data.username)
        )
        if existing_username.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Username already taken")

        # Create new user
        user = User(
            organization_id="00000000-0000-0000-0000-000000000000",  # Default org for now
            email=user_data.email,
            username=user_data.username,
            full_name=user_data.full_name,
            hashed_password=get_password_hash(user_data.password),
            role=user_data.role,
            is_active=user_data.is_active,
            preferences=user_data.preferences or {},
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)

        return UserResponse.from_orm(user)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}")


@router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str, user_data: UserUpdate, db: AsyncSession = Depends(get_db)
):
    """Update an existing user (admin only)"""
    try:
        result = await db.execute(
            select(User).where(and_(User.id == user_id, User.deleted_at.is_(None)))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Check for email conflicts
        if user_data.email and user_data.email != user.email:
            existing_email = await db.execute(
                select(User).where(User.email == user_data.email)
            )
            if existing_email.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Email already registered")

        # Check for username conflicts
        if user_data.username and user_data.username != user.username:
            existing_username = await db.execute(
                select(User).where(User.username == user_data.username)
            )
            if existing_username.scalar_one_or_none():
                raise HTTPException(status_code=400, detail="Username already taken")

        # Update fields
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)

        await db.commit()
        await db.refresh(user)

        return UserResponse.from_orm(user)

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating user: {str(e)}")


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, db: AsyncSession = Depends(get_db)):
    """Delete a user (soft delete, admin only)"""
    try:
        result = await db.execute(
            select(User).where(and_(User.id == user_id, User.deleted_at.is_(None)))
        )
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Soft delete
        user.deleted_at = datetime.now()
        user.is_active = False
        await db.commit()

        return {"message": "User deleted successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error deleting user: {str(e)}")


@router.get("/users/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user profile"""
    return UserResponse.from_orm(current_user)


@router.put("/users/me", response_model=UserResponse)
async def update_current_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user profile"""
    try:
        # Update fields
        update_data = profile_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(current_user, field, value)

        await db.commit()
        await db.refresh(current_user)

        return UserResponse.from_orm(current_user)

    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")


@router.put("/users/me/password")
async def update_current_user_password(
    password_data: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Update current user password"""
    try:
        # Verify current password
        if not verify_password(
            password_data.current_password, current_user.hashed_password
        ):
            raise HTTPException(status_code=400, detail="Current password is incorrect")

        # Update password
        current_user.hashed_password = get_password_hash(password_data.new_password)
        await db.commit()

        return {"message": "Password updated successfully"}

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=500, detail=f"Error updating password: {str(e)}"
        )


@router.post("/auth/login", response_model=LoginResponse)
async def login(login_data: LoginRequest, db: AsyncSession = Depends(get_db)):
    """Login user and return access token"""
    try:
        # Find user by username or email
        user_result = await db.execute(
            select(User).where(
                and_(
                    or_(
                        User.username == login_data.username,
                        User.email == login_data.username,
                    ),
                    User.is_active == True,
                    User.deleted_at.is_(None),
                )
            )
        )
        user = user_result.scalar_one_or_none()

        if not user or not verify_password(login_data.password, user.hashed_password):
            raise HTTPException(
                status_code=401,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token
        access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )

        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.access_token_expire_minutes * 60,
            user=UserResponse.from_orm(user),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during login: {str(e)}")


@router.post("/auth/logout")
async def logout():
    """Logout user (client should discard token)"""
    return {"message": "Successfully logged out"}


@router.post("/auth/refresh", response_model=TokenRefreshResponse)
async def refresh_token(
    refresh_data: TokenRefreshRequest, db: AsyncSession = Depends(get_db)
):
    """Refresh access token"""
    try:
        # TODO: Implement refresh token logic
        # For now, return error as refresh tokens are not implemented
        raise HTTPException(
            status_code=501, detail="Refresh token functionality not implemented"
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error refreshing token: {str(e)}")


@router.get("/users/stats", response_model=UserStats)
async def get_user_stats(db: AsyncSession = Depends(get_db)):
    """Get user statistics"""
    try:
        # Get total users
        total_result = await db.execute(
            select(func.count(User.id)).where(User.deleted_at.is_(None))
        )
        total_users = total_result.scalar()

        # Get active/inactive users
        active_result = await db.execute(
            select(func.count(User.id)).where(
                and_(User.is_active == True, User.deleted_at.is_(None))
            )
        )
        active_users = active_result.scalar()
        inactive_users = total_users - active_users

        # Get role counts
        role_counts = {}
        for role in ["admin", "technician", "manager", "user"]:
            result = await db.execute(
                select(func.count(User.id)).where(
                    and_(User.role == role, User.deleted_at.is_(None))
                )
            )
            role_counts[role] = result.scalar()

        return UserStats(
            total_users=total_users,
            active_users=active_users,
            inactive_users=inactive_users,
            admin_users=role_counts.get("admin", 0),
            technician_users=role_counts.get("technician", 0),
            manager_users=role_counts.get("manager", 0),
            regular_users=role_counts.get("user", 0),
        )

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching user stats: {str(e)}"
        )
