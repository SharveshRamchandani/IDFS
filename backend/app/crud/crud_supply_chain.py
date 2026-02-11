from sqlalchemy.orm import Session
from app.models.supply_chain import Supplier, PurchaseOrder, Shipment
from app.schemas.supply_chain import (
    SupplierCreate, PurchaseOrderCreate, ShipmentCreate,
    SupplierUpdate, PurchaseOrderUpdate, ShipmentUpdate
)

# Supplier
def get_supplier(db: Session, supplier_id: int):
    return db.query(Supplier).filter(Supplier.id == supplier_id).first()

def get_suppliers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Supplier).offset(skip).limit(limit).all()

def create_supplier(db: Session, supplier: SupplierCreate):
    db_obj = Supplier(**supplier.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

# Purchase Order
def get_purchase_orders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(PurchaseOrder).offset(skip).limit(limit).all()

def create_purchase_order(db: Session, po: PurchaseOrderCreate):
    db_obj = PurchaseOrder(**po.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_purchase_order_status(db: Session, po_id: int, status: str):
    db_obj = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if db_obj:
        db_obj.status = status
        db.commit()
        db.refresh(db_obj)
    return db_obj

# Shipments
def get_shipments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Shipment).offset(skip).limit(limit).all()

def create_shipment(db: Session, shipment: ShipmentCreate):
    db_obj = Shipment(**shipment.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj
