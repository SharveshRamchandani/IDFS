from typing import Any, Dict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_sales
import numpy as np
import pandas as pd
import json
import os

from app import models

router = APIRouter()

@router.get("/metrics")
def get_model_metrics(
    current_user: models.user.User = Depends(deps.get_current_analyst_user),
    db: Session = Depends(deps.get_db)
) -> Dict[str, Any]:
    """
    Evaluate the performance of the current forecasting logic.
    Calculates accuracy metrics on a subset of recent data.
    """
    metrics_file = "prophet_model_metrics.json"
    if os.path.exists(metrics_file):
        with open(metrics_file, "r") as f:
            metrics_raw = json.load(f)
            
        mape_percent = metrics_raw.get('mape', 0) * 100
        accuracy = max(0, 100 - mape_percent)
        
        return {
            "model_status": "Active",
            "last_training_date": "Recent",
            "metrics": {
                "MAPE": f"{mape_percent:.2f}%",
                "RMSE": round(metrics_raw.get('rmse', 0), 2),
                "Accuracy": f"{accuracy:.2f}%"
            },
            "description": "Metrics based on Facebook Prophet validation."
        }
    
    return {
        "model_status": "Active",
        "last_training_date": "N/A",
        "metrics": {
            "MAPE": "N/A",
            "RMSE": 0,
            "Accuracy": "N/A"
        },
        "description": "Metrics not available. Please train the model."
    }
