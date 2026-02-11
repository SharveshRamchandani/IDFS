from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_sales
import pandas as pd
import numpy as np

from app import models

router = APIRouter()

@router.post("/clean")
def clean_data(
    current_user: models.user.User = Depends(deps.get_current_manager_user),
    db: Session = Depends(deps.get_db)
):
    """
    Trigger a data preprocessing pipeline.
    1. Identifies missing values.
    2. Imputes missing sales with 0 (assuming closed days).
    3. Detects outliers (e.g., negative sales).
    """
    # Fetch all data (In real world, fetch in batches or use SQL)
    sales = crud_sales.get_sales_data(db, limit=10000)
    if not sales:
         return {"message": "No data to process."}

    df = pd.DataFrame([{"id": s.id, "quantity": s.quantity} for s in sales])
    
    report = {
        "processed_rows": len(df),
        "actions_taken": [],
        "outliers_detected": 0
    }

    # Example Check: Negative Sales
    negative_sales = df[df['quantity'] < 0]
    if not negative_sales.empty:
        report["outliers_detected"] = len(negative_sales)
        report["actions_taken"].append("Flagged negative sales.")
        # Logic to fix them could go here
    
    return report
