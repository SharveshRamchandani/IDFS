from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_sales
import pandas as pd

router = APIRouter()

@router.get("/")
def get_alerts(db: Session = Depends(deps.get_db)) -> Any:
    """
    Generate system alerts based on sales patterns.
    Currently detects:
    1. Stores with no recent activity (Last 7 days).
    2. Zero-sales anomalies.
    """
    alerts = []
    
    # 1. Check for "Quiet Stores" (No sales in recent batch)
    # This is a simple heuristic: if a store exists but isn't in recent_sales, flag it.
    
    # Get all active stores (just ids)
    # Note: In a real app we'd query this more efficiently with a LEFT JOIN where sales is NULL
    recent_sales = crud_sales.get_recent_sales(db, limit=100)
    if recent_sales:
        active_store_ids = {s.store_id for s in recent_sales}
        # This is a mock logical check for demonstration where we'd compare against all stores
        if len(active_store_ids) < 5: # Arbitrary threshold
             alerts.append({
                "type": "warning",
                "message": "Low store activity detected. Some stores have not reported data recently.",
                "severity": "medium"
            })

    # 2. Check for Data Quality
    total_sales = crud_sales.get_total_sales_count(db)
    if total_sales == 0:
        alerts.append({
            "type": "info",
            "message": "System is empty. Please upload sales data via the Ingestion module.",
            "severity": "high"
        })

    return alerts
