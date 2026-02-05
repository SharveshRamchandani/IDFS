from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_sales

router = APIRouter()

@router.get("/")
def read_dashboard(db: Session = Depends(deps.get_db)):
    """
    Get dashboard statistics
    """
    total_products = crud_sales.get_total_products_count(db)
    total_stores = crud_sales.get_total_stores_count(db)
    total_sales = crud_sales.get_total_sales_count(db)
    
    # Advanced Stats
    revenue = crud_sales.get_total_revenue(db)
    total_qty = crud_sales.get_total_quantity(db)
    avg_daily = crud_sales.get_avg_daily_sales(db)
    
    recent_sales = crud_sales.get_recent_sales(db, limit=5)
    
    top_stores_raw = crud_sales.get_top_stores(db, limit=5)
    # Convert Row tuples to dicts
    top_stores = [
        {"store_id": r.store_id, "region": r.region, "revenue": r.revenue}
        for r in top_stores_raw
    ]

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
