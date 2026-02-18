from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "IDFS Backend"
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:5173", "http://localhost:3000", "http://localhost:8000", "http://localhost:8080"]

    # Database
    # Using SQLite for initial setup ease, intended for PostgreSQL
    DATABASE_URL: str = "sqlite:///./idfs.db"
    
    # Security
    SECRET_KEY: str = "CHANGE_THIS_SECRET_KEY_IN_PRODUCTION"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Google OAuth
    GOOGLE_CLIENT_ID: str = "138379454132-r3t52u7nflg5tsi61r1r0ektt0f51723.apps.googleusercontent.com"

    # Live Data Simulator
    ENABLE_LIVE_SIMULATOR: bool = True

    class Config:
        case_sensitive = True
        env_file = ".env"
        # Increase priority of env file
        env_file_encoding = 'utf-8'

settings = Settings()

# Fallback for development if SECRET_KEY is not set
if not settings.SECRET_KEY:
    import secrets
    print("[WARNING] SECRET_KEY not set in .env or config. Using temporary random key.")
    settings.SECRET_KEY = secrets.token_urlsafe(32)
