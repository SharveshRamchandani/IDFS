from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException

from app import crud, models, schemas
from app.api import deps
from sqlalchemy.orm import Session

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
    current_user: models.user.User = Depends(deps.get_current_admin_user),
    db = Depends(deps.get_db),
) -> Any:
    """
    Retrieve users.
    """
    # Simple placeholder for now, you'd implement crud.user.get_multi
    users = db.query(models.user.User).offset(skip).limit(limit).all()
    return users

@router.post("/", response_model=schemas.user.User)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: schemas.user.UserCreate,
    current_user: models.User = Depends(deps.get_current_admin_user),
) -> Any:
    """
    Create new user.
    """
    user = crud.crud_user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = crud.crud_user.create(db, obj_in=user_in)
    return user

@router.put("/{user_id}/role", response_model=schemas.user.User)
def update_user_role(
    user_id: int,
    role: str,
    current_user: models.User = Depends(deps.get_current_admin_user),
    db: Session = Depends(deps.get_db),
) -> Any:
    """
    Update a user's role.
    """
    user = crud.crud_user.get(db, id=user_id)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this id does not exist in the system",
        )
    
    # Check if role is valid
    valid_roles = [r.value for r in models.UserRole]
    if role not in valid_roles:
         raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of {valid_roles}",
        )
    
    user = crud.crud_user.update(db, db_obj=user, obj_in={"role": role})
    return user
