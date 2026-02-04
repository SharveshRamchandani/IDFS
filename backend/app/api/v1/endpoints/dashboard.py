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
    recent_sales = crud_sales.get_recent_sales(db, limit=5)
    
    return {
        "summary": {
            "total_products": total_products,
            "total_stores": total_stores,
            "total_sales_records": total_sales
        },
        "recent_sales": recent_sales
    }
