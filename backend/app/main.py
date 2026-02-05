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
    from app.db.session import SessionLocal
    from app.crud import crud_holiday
    from app.schemas.holiday import HolidayCreate
    import pandas as pd
    import os
    
    print("Checking ML model status...")
    forecaster.load_model()
    if not forecaster.is_trained:
        print("Model not found. Training initial model with dummy data...")
        # Note: In production we might not want to auto-train on startup if it takes too long
        # forecaster.train() 
        pass

    # Check Holidays
    db = SessionLocal()
    try:
        holidays_count = len(crud_holiday.get_all_holidays(db))
        if holidays_count < 10:
            csv_path = "data/holidays_events.csv"
            if os.path.exists(csv_path):
                print(f"🎄 Configuring Holidays from {csv_path}...")
                df = pd.read_csv(csv_path)
                added = 0
                for _, row in df.iterrows():
                    try:
                        obj_in = HolidayCreate(
                            date=pd.to_datetime(row['date']).date(),
                            type=str(row['type']),
                            locale=str(row['locale']),
                            locale_name=str(row['locale_name']),
                            description=str(row['description']),
                            transferred=bool(row['transferred'])
                        )
                        crud_holiday.create_holiday(db, obj_in)
                        added += 1
                    except:
                        pass
                print(f"✅ Auto-Seeded {added} holidays.")
            else:
                print("⚠️ No holidays.csv found.")
    except Exception as e:
        print(f"❌ Holiday seed failed: {e}")
    finally:
        db.close()

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
