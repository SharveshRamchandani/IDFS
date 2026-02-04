from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/me", response_model=schemas.user.User)
def read_user_me(
    current_user: models.user.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user

@router.get("/", response_model=List[schemas.user.User])
def read_users(
    skip: int = 0,
    limit: int = 100,
    current_user: models.user.User = Depends(deps.get_current_active_user),
    db = Depends(deps.get_db),
) -> Any:
    """
    Retrieve users.
    """
    # Simple placeholder for now, you'd implement crud.user.get_multi
    users = db.query(models.user.User).offset(skip).limit(limit).all()
    return users
