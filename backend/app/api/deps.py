from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.core import security
from app.core.config import settings
from app.db.session import SessionLocal

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login/access-token"
)

def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> models.User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = schemas.token.TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )
    user = crud.crud_user.get(db, id=token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_active_superuser(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user

def get_current_admin_user(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    """Admin only - Full access to everything"""
    if current_user.role != models.UserRole.ADMIN and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access denied. Admin privileges required."
        )
    return current_user

def get_current_store_manager_user(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    """Store Manager or higher - Can manage inventory and view forecasts"""
    allowed_roles = [models.UserRole.ADMIN, models.UserRole.STORE_MANAGER]
    if current_user.role not in allowed_roles and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access denied. Store Manager privileges required."
        )
    return current_user

def get_current_manager_user(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    """Manager or higher - Can manage ingestion"""
    allowed_roles = [models.UserRole.ADMIN, models.UserRole.STORE_MANAGER]
    if current_user.role not in allowed_roles and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access denied. Manager privileges required."
        )
    return current_user

def get_current_analyst_user(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    """Inventory Analyst or higher - Can view analytics and forecasts"""
    allowed_roles = [models.UserRole.ADMIN, models.UserRole.STORE_MANAGER, models.UserRole.INVENTORY_ANALYST]
    if current_user.role not in allowed_roles and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access denied. Analyst privileges required."
        )
    return current_user

def get_current_staff_user(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    """Staff or higher - Can view basic inventory"""
    allowed_roles = [models.UserRole.ADMIN, models.UserRole.STORE_MANAGER, models.UserRole.INVENTORY_ANALYST, models.UserRole.STAFF]
    if current_user.role not in allowed_roles and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Access denied. Staff privileges required."
        )
    return current_user
