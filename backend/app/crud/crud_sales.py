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
        quantity=obj_in.quantity
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

