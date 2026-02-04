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

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
