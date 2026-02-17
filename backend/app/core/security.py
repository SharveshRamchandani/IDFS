from datetime import datetime, timedelta, timezone
from typing import Any, Union
from jose import jwt
from app.core.config import settings
import hashlib
import bcrypt

ALGORITHM = "HS256"

def create_access_token(subject: Union[str, Any], expires_delta: timedelta = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"exp": expire, "sub": str(subject)}
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    # Pre-hash password with SHA-256 to bypass bcrypt's 72-byte limit
    # This ensures functionality for long passwords without truncation issues in raw bcrypt
    password_hash_sha256 = hashlib.sha256(plain_password.encode('utf-8')).hexdigest()
    # Check password using bcrypt
    # bcrypt.checkpw expects bytes for both arguments
    try:
        return bcrypt.checkpw(password_hash_sha256.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        return False # Handle potential encoding errors gracefully

def get_password_hash(password: str) -> str:
    # Pre-hash password with SHA-256 to bypass bcrypt's 72-byte limit
    password_hash_sha256 = hashlib.sha256(password.encode('utf-8')).hexdigest()
    # Hash using bcrypt
    # decode('utf-8') to store as string in database
    return bcrypt.hashpw(password_hash_sha256.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')