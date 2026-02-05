from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_sales
import pandas as pd
import numpy as np

router = APIRouter()

@router.get("/predict")
def predict_demand(
    sku: str,
    store_id: str,
    days: int = 7,
    db: Session = Depends(deps.get_db)
):
    """
    Generate demand forecast for a specific Product and Store for the next N days.
    """
    if days < 1 or days > 365:
        raise HTTPException(status_code=400, detail="Forecast horizon (days) must be between 1 and 365.")

    sales_data = crud_sales.get_sales_by_sku_store(db, sku=sku, store_id=store_id)
    
    if not sales_data:
        raise HTTPException(status_code=404, detail="No historical data found for this product/store combination.")
    
    # Prepare DataFrame
    data_records = [{"date": s.date, "quantity": s.quantity} for s in sales_data]
    df = pd.DataFrame(data_records)
    df['date'] = pd.to_datetime(df['date'])
    df = df.set_index('date')
    df = df.sort_index()
    
    # Resample to daily frequency and fill missing with 0
    df = df.resample('D').sum().fillna(0)
    
    # Check for all zeros
    if df['quantity'].sum() == 0:
         forecast_values = [0] * days
         return {
            "sku": sku,
            "store_id": store_id,
            "forecast_dates": pd.date_range(start=df.index[-1] + pd.Timedelta(days=1), periods=days).strftime('%Y-%m-%d').tolist(),
            "forecast_values": forecast_values,
            "method": "Zero Demand (Historical Data is all 0)"
        }

    # Logic for forecasting
    forecast_values = []
    method = ""

    if len(df) < 7:
         # Not enough data for complex model, use simple average
         avg = df['quantity'].mean() if not df.empty else 0
         forecast_values = [avg] * days
         method = "Simple Average (Insufficient Data)"
    else:
        try:
            from statsmodels.tsa.holtwinters import ExponentialSmoothing
            # Simple Exponential Smoothing (Holt-Winters)
            # Add 'try' block specifically for fitting
            model = ExponentialSmoothing(
                df['quantity'], 
                seasonal_periods=7, # Assume weekly seasonality if enough data
                trend='add',
                seasonal='add',
                initialization_method="estimated"
            ).fit()
            predictions = model.forecast(days)
            forecast_values = predictions.tolist()
            method = "Exponential Smoothing (Holt-Winters)"
        except Exception as e:
            # Fallback to moving average if statsmodels fails (e.g., convergence issues)
            recent_avg = df['quantity'].tail(7).mean()
            forecast_values = [recent_avg] * days
            method = f"Moving Average (Fallback due to model error: {str(e)})"

    # Generate dates for forecast
    last_date = df.index[-1]
    forecast_dates = pd.date_range(start=last_date + pd.Timedelta(days=1), periods=days)

    return {
        "sku": sku,
        "store_id": store_id,
        "forecast_dates": forecast_dates.strftime('%Y-%m-%d').tolist(),
        "forecast_values": [round(x, 2) for x in forecast_values],
        "method": method
    }

@router.get("/global")
def predict_global_demand(days: int = 30, detailed: bool = False):
    """
    Generate global demand forecast using the advanced Prophet model.
    Optionally returns detailed components (trend, seasonality).
    """
    from app.ml.inference import predict_demand, get_components
    
    try:
        forecast = predict_demand(days=days)
        if isinstance(forecast, dict) and "error" in forecast:
             raise HTTPException(status_code=503, detail=forecast["error"])
             
        response = {
            "forecast": forecast,
            "method": "Facebook Prophet (Enhanced)"
        }
        
        if detailed:
            components = get_components(days=days)
            if components:
                response["components"] = components
                
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from typing import List, Optional
from pydantic import BaseModel

class SimulationRequest(BaseModel):
    days: int = 30
    promotion_schedule: List[int] # 0 or 1 for each day

@router.post("/simulate")
def simulate_forecast_scenario(request: SimulationRequest):
    """
    Run a 'What-If' simulation for future promotions.
    """
    from app.ml.model import forecaster
    
    if not forecaster.is_trained:
        raise HTTPException(status_code=503, detail="Model is not trained.")
        
    try:
        result = forecaster.simulate_scenario(
            days=request.days, 
            promotion_schedule=request.promotion_schedule
        )
        return {"scenario_forecast": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
