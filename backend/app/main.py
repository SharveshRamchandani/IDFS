from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set all CORS enabled origins
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
async def startup_event():
    from app.ml.model import forecaster
    print("Checking ML model status...")
    forecaster.load_model()
    if not forecaster.is_trained:
        print("Model not found. Training initial model with dummy data...")
        forecaster.train()

@app.get("/")
def root():
    return {"message": "Welcome to IDFS Backend"}

from fastapi import Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.models.forecast import Forecast

@app.get("/predict-test")
def predict_test(days: int = 30, db: Session = Depends(deps.get_db)):
    from app.ml.model import forecaster
    if not forecaster.is_trained:
        return {"error": "Model not trained yet."}
    
    # 1. Generate prediction
    prediction = forecaster.predict(days=days)
    
    # 2. Save to Database
    try:
        # Optional: Clear old future forecasts to avoid duplicates?
        # For now, we just append new ones.
        new_forecasts = []
        for row in prediction:
            f = Forecast(
                forecast_date=row['ds'],
                predicted_value=row['yhat'],
                lower_bound=row['yhat_lower'],
                upper_bound=row['yhat_upper'],
                model_version="Prophet-1.0"
            )
            db.add(f)
            new_forecasts.append(f)
        
        db.commit()
        print(f"✅ Saved {len(new_forecasts)} forecast rows to DB.")
    except Exception as e:
        print(f"❌ Error saving to DB: {e}")
        db.rollback()

    return {
        "forecast": prediction,
        "status": "saved_to_db"
    }
