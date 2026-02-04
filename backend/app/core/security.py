from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = "HS256"

def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

import hashlib

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Pre-hash password with SHA-256 to bypass bcrypt's 72-byte limit
    # This ensures functionality for long passwords without truncation
    password_hash = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    return pwd_context.verify(password_hash, hashed_password)

def get_password_hash(password: str) -> str:
    # Pre-hash password with SHA-256 to bypass bcrypt's 72-byte limit
    password_hash = hashlib.sha256(password.encode('utf-8')).hexdigest()
    return pwd_context.hash(password_hash)
