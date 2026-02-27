from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.crud import crud_sales

from app import models
import logging

logger = logging.getLogger(__name__)

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
        logger.error(f"Error fetching product count: {e}")
        total_products = 0

    try:
        total_stores = crud_sales.get_total_stores_count(db) or 0
    except Exception as e:
        logger.error(f"Error fetching total_stores count: {e}")
        total_stores = 0

    try:
        total_sales = crud_sales.get_total_sales_count(db) or 0
    except Exception as e:
        logger.error(f"Error fetching total_sales count: {e}")
        total_sales = 0
    
    # Advanced Stats
    try:
        revenue = crud_sales.get_total_revenue(db) or 0.0
    except Exception as e:
        logger.error(f"Error fetching revenue: {e}")
        revenue = 0.0
            
    try:
        total_qty = crud_sales.get_total_quantity(db) or 0
    except Exception as e:
        logger.error(f"Error fetching total_qty: {e}")
        total_qty = 0
            
    try:
        avg_daily = crud_sales.get_avg_daily_sales(db) or 0.0
    except Exception as e:
        logger.error(f"Error fetching avg_daily: {e}")
        avg_daily = 0.0
    
    recent_sales = []
    try:
        recent_sales = crud_sales.get_recent_sales(db, limit=5)
    except Exception as e:
        logger.error(f"Error fetching recent_sales: {e}")
        pass
    
    top_stores = []
    try:
        top_stores = crud_sales.get_top_stores(db, limit=5)  # already returns list of dicts
    except Exception as e:
        logger.error(f"Error fetching top stores: {e}")
        top_stores = []

    low_stock_count = 0
    out_of_stock_count = 0
    try:
        low_stock_count = (
            db.query(models.StoreInventory)
            .filter(
                models.StoreInventory.quantity_on_hand > 0,
                models.StoreInventory.quantity_on_hand < models.StoreInventory.low_stock_threshold
            )
            .count()
        )
        out_of_stock_count = (
            db.query(models.StoreInventory)
            .filter(models.StoreInventory.quantity_on_hand == 0)
            .count()
        )
    except Exception as e:
        logger.error(f"Error fetching stock alert counts: {e}")

    today_qty = 0
    today_revenue = 0.0
    today_records = 0
    try:
        from datetime import date
        from sqlalchemy import func as sqlfunc
        today = date.today()
        today_rows = (
            db.query(
                sqlfunc.count(models.SalesData.id).label("records"),
                sqlfunc.sum(models.SalesData.quantity).label("qty"),
            )
            .filter(models.SalesData.date == today)
            .first()
        )
        if today_rows:
            today_records = today_rows.records or 0
            today_qty = today_rows.qty or 0

        # Revenue = join with product price
        rev_rows = (
            db.query(models.SalesData, models.Product)
            .join(models.Product, models.SalesData.sku_id == models.Product.id)
            .filter(models.SalesData.date == today)
            .all()
        )
        today_revenue = round(
            sum((sd.quantity * (p.price or 0)) for sd, p in rev_rows), 2
        )
    except Exception as e:
        logger.error(f"Error fetching today's sales: {e}")

    return {
        "summary": {
            "total_products": total_products,
            "total_stores": total_stores,
            "total_sales_records": total_sales,
            "low_stock_count": low_stock_count,
            "out_of_stock_count": out_of_stock_count,
        },
        "today": {
            "date": str(date.today()),
            "records": today_records,
            "quantity": today_qty,
            "revenue": today_revenue,
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
        logger.error(f"Error fetching trend: {e}")
        return []

@router.get("/notifications")
def get_dashboard_notifications(
    current_user: models.user.User = Depends(deps.get_current_active_user),
    db: Session = Depends(deps.get_db)
):
    """
    Get system notifications for dashboard.
    """
    from datetime import date, timedelta
    notifications = []

    try:
        total_sales = crud_sales.get_total_sales_count(db)
        if total_sales == 0:
            notifications.append({
                "id": "1",
                "message": "System is empty. Please upload sales data via the Ingestion module.",
                "timestamp": "Just Now",
                "isRead": False,
                "isFavorite": False,
                "isArchived": False
            })

        # Check for stores with no sales in the past 7 days
        cutoff_date = date.today() - timedelta(days=7)
        all_store_ids = {s.id for s in db.query(models.Store.id).all()}
        active_store_ids = {
            row.store_id
            for row in db.query(models.SalesData.store_id)
            .filter(models.SalesData.date >= cutoff_date)
            .distinct()
            .all()
        }
        inactive_count = len(all_store_ids - active_store_ids)
        if inactive_count > 0 and len(all_store_ids) > 0:
            notifications.append({
                "id": "2",
                "message": f"{inactive_count} of {len(all_store_ids)} store(s) have not reported sales in the last 7 days.",
                "timestamp": "Just Now",
                "isRead": False,
                "isFavorite": False,
                "isArchived": False
            })
    except Exception as e:
        logger.error(f"Error generating notifications: {e}")

    return notifications


@router.get("/sales-dates")
def get_sales_dates(db: Session = Depends(deps.get_db)):
    """
    Return all distinct dates that have at least one sales record in the DB.
    Used by the frontend calendar to display dots on days with actual data.
    Always reflects the live DB state - auto-updates when new data is uploaded.
    """
    from sqlalchemy import func
    rows = (
        db.query(func.distinct(models.SalesData.date))
        .order_by(models.SalesData.date)
        .all()
    )
    return {"dates": [str(r[0]) for r in rows]}


@router.get("/sales-by-date")
def get_sales_by_date(
    date: str,
    store_id: str = None,
    sku: str = None,
    category: str = None,
    onpromotion: bool = None,
    db: Session = Depends(deps.get_db)
):
    """
    Return all sales records for a given date with optional filters.
    Query params:
      - date        (required): YYYY-MM-DD
      - store_id    (optional): filter by store string ID
      - sku         (optional): filter by product SKU (partial match)
      - category    (optional): filter by product category
      - onpromotion (optional): true/false
    """
    from datetime import date as date_type
    from sqlalchemy import func

    try:
        parsed_date = date_type.fromisoformat(date)
    except ValueError:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    query = (
        db.query(models.SalesData)
        .join(models.Product, models.SalesData.sku_id == models.Product.id)
        .join(models.Store, models.SalesData.store_id == models.Store.id)
        .filter(models.SalesData.date == parsed_date)
    )

    if store_id:
        query = query.filter(models.Store.store_id.ilike(f"%{store_id}%"))
    if sku:
        query = query.filter(models.Product.sku.ilike(f"%{sku}%"))
    if category:
        query = query.filter(models.Product.category.ilike(f"%{category}%"))
    if onpromotion is not None:
        query = query.filter(models.SalesData.onpromotion == onpromotion)

    records = query.order_by(models.Store.store_id, models.Product.sku).all()

    rows = [
        {
            "id": r.id,
            "sku": r.product.sku,
            "product_name": r.product.name or r.product.sku,
            "category": r.product.category or "—",
            "store_id": r.store.store_id,
            "region": r.store.region or "—",
            "quantity": r.quantity,
            "revenue": round(r.quantity * (r.product.price or 0), 2),
            "onpromotion": r.onpromotion,
            "price": r.product.price or 0,
        }
        for r in records
    ]

    total_qty = sum(r["quantity"] for r in rows)
    total_revenue = round(sum(r["revenue"] for r in rows), 2)
    unique_stores = len({r["store_id"] for r in rows})
    unique_skus = len({r["sku"] for r in rows})

    return {
        "date": date,
        "summary": {
            "total_records": len(rows),
            "total_quantity": total_qty,
            "total_revenue": total_revenue,
            "unique_stores": unique_stores,
            "unique_skus": unique_skus,
        },
        "records": rows,
    }
