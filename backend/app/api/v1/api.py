from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, ingestion, forecasting, dashboard

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
api_router.include_router(forecasting.router, prefix="/forecasting", tags=["forecasting"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
