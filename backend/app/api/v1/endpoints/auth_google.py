from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from google.oauth2 import id_token
from google.auth.transport import requests

from app import crud, models, schemas
from app.api import deps
from app.core import security
from app.core.config import settings
from app.schemas.token import Token
from app.schemas.user import UserCreate

router = APIRouter()

@router.post("/login/google", response_model=Token)
def login_google(
    db: Session = Depends(deps.get_db),
    credential: str = Body(..., embed=True) 
) -> Any:
    """
    Login using Google OAuth2 credential (JWT).
    1. Verify Google Token
    2. Check if user exists
    3. If not, create user (default role: ANALYST)
    4. Issue our own JWT access token
    """
    print(f"🔹 Received Google Token: {credential[:20]}...")
    try:
        # Verify the token with Google
        id_info = id_token.verify_oauth2_token(
            credential, 
            requests.Request(), 
            settings.GOOGLE_CLIENT_ID
        )
        print(f"✅ Token Verified. User: {id_info.get('email')}")
        
        email = id_info.get("email")
        if not email:
            print("❌ Token missing email")
            raise HTTPException(status_code=400, detail="Google token missing email")
            
        # Check if user exists
        user = crud.crud_user.get_by_email(db, email=email)
        
        if not user:
            print("🆕 User not found, creating new account...")
            # Auto-register new user
            import secrets
            random_password = secrets.token_urlsafe(32)
            
            user_in = UserCreate(
                email=email,
                full_name=id_info.get("name"),
                password=random_password,
                role="analyst" # Default role
            )
            user = crud.crud_user.create(db, obj_in=user_in)
            print(f"✅ User created with ID: {user.id}")
            
        if not user.is_active:
             print("❌ Inactive user")
             raise HTTPException(status_code=400, detail="Inactive user")

        # Create our access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        token = security.create_access_token(
                user.id, expires_delta=access_token_expires
            )
        print("✅ Access Token Generated")
        return {
            "access_token": token,
            "token_type": "bearer",
        }
        
    except ValueError as e:
        print(f"❌ Invalid Token Error: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid Google Token: {str(e)}")
    except Exception as e:
        print(f"❌ Google Login Exception: {e}")
        raise HTTPException(status_code=400, detail=f"Google Login Failed: {str(e)}")
