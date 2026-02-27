from typing import List, Optional
from datetime import date
from sqlalchemy.orm import Session
from app.models.sales import SalesData, Product, Store
from app.schemas.sales import ProductCreate, StoreCreate, SalesDataCreate

# Product CRUD
def get_product_by_sku(db: Session, sku: str) -> Optional[Product]:
    return db.query(Product).filter(Product.sku == sku).first()

def create_product(db: Session, obj_in: ProductCreate) -> Product:
    db_obj = Product(
        sku=obj_in.sku,
        category=obj_in.category,
        price=obj_in.price
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# Store CRUD
def get_store_by_store_id(db: Session, store_id: str) -> Optional[Store]:
    return db.query(Store).filter(Store.store_id == store_id).first()

def create_store(db: Session, obj_in: StoreCreate) -> Store:
    db_obj = Store(
        store_id=obj_in.store_id,
        region=obj_in.region
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# SalesData CRUD
def create_sales_data(db: Session, obj_in: SalesDataCreate, product_id: int, store_db_id: int) -> SalesData:
    db_obj = SalesData(
        date=obj_in.date,
        sku_id=product_id,
        store_id=store_db_id,
        quantity=obj_in.quantity,
        # onpromotion=obj_in.onpromotion
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def get_sales_data(db: Session, skip: int = 0, limit: int = 100) -> List[SalesData]:
    return db.query(SalesData).offset(skip).limit(limit).all()

def get_total_sales_count(db: Session) -> int:
    return db.query(SalesData).count()

def get_total_products_count(db: Session) -> int:
    return db.query(Product).count()

def get_total_stores_count(db: Session) -> int:
    return db.query(Store).count()

def get_recent_sales(db: Session, limit: int = 5) -> List[SalesData]:
    return db.query(SalesData).order_by(SalesData.date.desc()).limit(limit).all()

def get_sales_by_sku_store(db: Session, sku: str, store_id: str) -> List[SalesData]:
    return (
        db.query(SalesData)
        .join(Product)
        .join(Store)
        .filter(Product.sku == sku)
        .filter(Store.store_id == store_id)
        .order_by(SalesData.date)
        .all()
    )

def get_sales_data_detail(db: Session, date: date, sku_id: int, store_id: int) -> Optional[SalesData]:
    return (
        db.query(SalesData)
        .filter(SalesData.date == date)
        .filter(SalesData.sku_id == sku_id)
        .filter(SalesData.store_id == store_id)
        .first()
    )

from sqlalchemy import func

def get_total_revenue(db: Session) -> float:
    # quantity * product.price
    result = db.query(func.sum(SalesData.quantity * Product.price)).select_from(SalesData).join(Product).scalar()
    return result or 0.0

def get_total_quantity(db: Session) -> int:
    result = db.query(func.sum(SalesData.quantity)).scalar()
    return result or 0

def get_avg_daily_sales(db: Session) -> float:
    # Total Quantity / Distinct Dates
    total_qty = get_total_quantity(db)
    distinct_dates = db.query(func.count(func.distinct(SalesData.date))).scalar()
    if distinct_dates and distinct_dates > 0:
        return total_qty / distinct_dates
    return 0.0

def get_top_stores(db: Session, limit: int = 5):
    """
    Rank stores by revenue (qty × price). 
    If no prices are set in the DB, fall back to ranking by quantity.
    Returns dicts with store_id, region, revenue (or quantity), and metric_label.
    """
    from sqlalchemy import case

    # Try revenue first (COALESCE handles NULL price → 0)
    rows = (
        db.query(
            Store.store_id,
            Store.region,
            func.sum(
                SalesData.quantity * func.coalesce(Product.price, 0)
            ).label("revenue"),
            func.sum(SalesData.quantity).label("total_qty"),
        )
        .join(SalesData, SalesData.store_id == Store.id)
        .join(Product, Product.id == SalesData.sku_id)
        .group_by(Store.id, Store.store_id, Store.region)
        .order_by(func.sum(SalesData.quantity * func.coalesce(Product.price, 0)).desc())
        .limit(limit)
        .all()
    )

    # If all revenue is 0 (no prices in DB), switch to quantity ranking
    total_revenue = sum(r.revenue or 0 for r in rows)
    if total_revenue == 0:
        rows = sorted(rows, key=lambda r: r.total_qty or 0, reverse=True)
        return [
            {
                "store_id": r.store_id,
                "region": r.region,
                "revenue": r.total_qty or 0,
                "metric": "quantity",
            }
            for r in rows
        ]

    return [
        {
            "store_id": r.store_id,
            "region": r.region,
            "revenue": round(float(r.revenue or 0), 2),
            "metric": "revenue",
        }
        for r in rows
    ]

from datetime import timedelta
    
def get_daily_sales_trend(db: Session, days: int = 30):
    start_date = date.today() - timedelta(days=days)
    return (
        db.query(
            SalesData.date, 
            func.sum(SalesData.quantity).label("quantity")
        )
        .filter(SalesData.date >= start_date)
        .group_by(SalesData.date)
        .order_by(SalesData.date)
        .all()
    )
