from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app import models
from pydantic import BaseModel

router = APIRouter()

# Schemas for Creation
class SupplierCreate(BaseModel):
    name: str
    contact: str
    email: str

class POCreate(BaseModel):
    supplier_id: int
    po_number: str
    total_amount: float

# Existing Read Schemas
from typing import List
class SupplierRead(BaseModel):
    id: int
    name: str
    contact: str
    email: str
    status: str
    rating: float

class PORead(BaseModel):
    id: int
    po_number: str
    supplier_name: str
    date: str
    total_amount: float
    status: str

class ShipmentRead(BaseModel):
    id: int
    tracking_number: str
    origin: str
    destination: str
    eta: str
    carrier: str
    status: str

@router.get("/suppliers", response_model=List[SupplierRead])
def get_suppliers(db: Session = Depends(deps.get_db)):
    suppliers = db.query(models.Supplier).all()
    return [
        {
            "id": s.id, 
            "name": s.name, 
            "contact": s.contact_person, 
            "email": s.email, 
            "status": s.status, 
            "rating": s.rating
        } 
        for s in suppliers
    ]

@router.post("/suppliers", response_model=SupplierRead)
def create_supplier(supplier_in: SupplierCreate, db: Session = Depends(deps.get_db)):
    supplier = models.Supplier(
        name=supplier_in.name,
        contact_person=supplier_in.contact,
        email=supplier_in.email,
        status="Active",
        rating=5.0
    )
    try:
        db.add(supplier)
        db.commit()
        db.refresh(supplier)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database constraint violated: {e}")
    return {
        "id": supplier.id,
        "name": supplier.name,
        "contact": supplier.contact_person,
        "email": supplier.email,
        "status": supplier.status,
        "rating": supplier.rating
    }

@router.get("/orders", response_model=List[PORead])
def get_orders(db: Session = Depends(deps.get_db)):
    orders = db.query(models.PurchaseOrder).all()
    return [
        {
            "id": po.id,
            "po_number": po.po_number,
            "supplier_name": po.supplier.name,
            "date": str(po.order_date),
            "total_amount": po.total_amount,
            "status": po.status
        }
        for po in orders
    ]

from datetime import date
@router.post("/orders", response_model=PORead)
def create_order(po_in: POCreate, db: Session = Depends(deps.get_db)):
    po = models.PurchaseOrder(
        po_number=po_in.po_number,
        supplier_id=po_in.supplier_id,
        total_amount=po_in.total_amount,
        order_date=date.today(),
        status="Pending"
    )
    try:
        db.add(po)
        db.commit()
        db.refresh(po)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database constraint violated: {e}")
    return {
        "id": po.id,
        "po_number": po.po_number,
        "supplier_name": po.supplier.name,
        "date": str(po.order_date),
        "total_amount": po.total_amount,
        "status": po.status
    }

@router.get("/shipments", response_model=List[ShipmentRead])
def get_shipments(db: Session = Depends(deps.get_db)):
    shipments = db.query(models.Shipment).all()
    return [
        {
            "id": s.id,
            "tracking_number": s.tracking_number,
            "origin": s.origin,
            "destination": s.destination,
            "eta": str(s.eta),
            "carrier": s.carrier,
            "status": s.status
        }
        for s in shipments
    ]
