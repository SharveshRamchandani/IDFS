from typing import Any, List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.crud import crud_sales
from datetime import date, timedelta

from app import models

router = APIRouter()

@router.get("/")
def get_alerts(
    current_user: models.user.User = Depends(deps.get_current_analyst_user),
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Generate system alerts based on sales patterns.
    Currently detects:
    1. Stores with no recent activity (Last 7 days).
    2. Zero-sales anomalies.
    """
    alerts = []
    cutoff_date = date.today() - timedelta(days=7)

    # 1. Find stores with NO sales in the last 7 days using a real database query.
    # Fetch all store IDs that exist in the system.
    all_store_ids = {s.id for s in db.query(models.Store.id).all()}

    # Fetch store IDs that DO have at least one sale record in the last 7 days.
    active_store_ids = {
        row.store_id
        for row in db.query(models.SalesData.store_id)
        .filter(models.SalesData.date >= cutoff_date)
        .distinct()
        .all()
    }

    # Inactive stores = all stores minus active stores
    inactive_store_ids = all_store_ids - active_store_ids

    if inactive_store_ids and len(all_store_ids) > 0:
        inactive_count = len(inactive_store_ids)
        total_count = len(all_store_ids)
        alerts.append({
            "type": "warning",
            "message": f"{inactive_count} of {total_count} store(s) have not reported any sales in the last 7 days.",
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
