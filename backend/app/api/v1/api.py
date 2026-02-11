from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, 
    auth_google, 
    users, 
    ingestion, 
    forecasting, 
    dashboard, 
    alerts, 
    evaluation, 
    preprocessing, 
    training,
    supply_chain,
    inventory
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(auth_google.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(ingestion.router, prefix="/ingestion", tags=["ingestion"])
api_router.include_router(forecasting.router, prefix="/forecasting", tags=["forecasting"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(alerts.router, prefix="/alerts", tags=["alerts"])
api_router.include_router(evaluation.router, prefix="/evaluation", tags=["evaluation"])
api_router.include_router(preprocessing.router, prefix="/preprocessing", tags=["preprocessing"])
api_router.include_router(training.router, prefix="/training", tags=["training"])
api_router.include_router(supply_chain.router, prefix="/supply-chain", tags=["supply-chain"])
api_router.include_router(inventory.router, prefix="/inventory", tags=["inventory"])
