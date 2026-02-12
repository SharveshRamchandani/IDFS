from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_sales

from app import models

router = APIRouter()

@router.get("/")
def read_dashboard(
    db: Session = Depends(deps.get_db)
):
    """
    Get dashboard statistics
    """
    try:
        total_products = crud_sales.get_total_products_count(db) or 0
    except Exception as e:
        print(f"Error fetching product count: {e}")
        total_products = 0

    try:
        total_stores = crud_sales.get_total_stores_count(db) or 0
    except:
            total_stores = 0

    try:
        total_sales = crud_sales.get_total_sales_count(db) or 0
    except:
            total_sales = 0
    
    # Advanced Stats
    try:
        revenue = crud_sales.get_total_revenue(db) or 0.0
    except Exception as e:
            print(f"Error fetching revenue: {e}")
            revenue = 0.0
            
    try:
        total_qty = crud_sales.get_total_quantity(db) or 0
    except:
            total_qty = 0
            
    try:
        avg_daily = crud_sales.get_avg_daily_sales(db) or 0.0
    except:
            avg_daily = 0.0
    
    recent_sales = []
    try:
        recent_sales = crud_sales.get_recent_sales(db, limit=5)
    except:
            pass
    
    top_stores = []
    try:
        top_stores_raw = crud_sales.get_top_stores(db, limit=5)
        # Convert Row tuples to dicts
        top_stores = [
            {"store_id": r.store_id, "region": r.region, "revenue": r.revenue}
            for r in top_stores_raw
        ]
    except Exception as e:
        print(f"Error fetching top stores: {e}")
        top_stores = []

    return {
        "summary": {
            "total_products": total_products,
            "total_stores": total_stores,
            "total_sales_records": total_sales
        },
        "total_revenue": revenue,
        "total_quantity": total_qty,
        "avg_daily_sales": avg_daily,
        "recent_sales": recent_sales,
        "top_stores": top_stores
    }

@router.get("/trend")
def get_daily_trend(
    days: int = 30,
    db: Session = Depends(deps.get_db)
):
    """
    Get daily aggregated sales trend.
    """
    try:
        data = crud_sales.get_daily_sales_trend(db, days=days)
        # SQLAlchemy returns Row(date, quantity)
        result = [
            {"date": row.date, "quantity": row.quantity}
            for row in data
        ]
        return result
    except Exception as e:
        print(f"Error fetching trend: {e}")
        return []
