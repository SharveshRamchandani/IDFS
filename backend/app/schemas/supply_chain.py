from typing import List, Optional
from datetime import date
from pydantic import BaseModel
from enum import Enum

# Using strings for Enums to make life easier with FE serialization
class SupplierStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    UNDER_REVIEW = "Under Review"

# Supplier Schemas
class SupplierBase(BaseModel):
    name: str
    contact_person: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    rating: Optional[float] = 0.0
    status: Optional[str] = SupplierStatus.ACTIVE

class SupplierCreate(SupplierBase):
    pass

class SupplierUpdate(SupplierBase):
    pass

class Supplier(SupplierBase):
    id: int
    
    class Config:
        from_attributes = True

# Purchase Order Schemas
class PurchaseOrderBase(BaseModel):
    po_number: str
    supplier_id: int
    order_date: date
    total_amount: float
    status: Optional[str] = "Pending"

class PurchaseOrderCreate(PurchaseOrderBase):
    pass

class PurchaseOrderUpdate(PurchaseOrderBase):
    pass

class PurchaseOrder(PurchaseOrderBase):
    id: int
    supplier: Optional[Supplier] = None  # To fetch supplier details with order
    
    class Config:
        from_attributes = True

# Shipment Schemas
class ShipmentBase(BaseModel):
    tracking_number: str
    origin: str
    destination: str
    eta: date
    carrier: str
    mode: str
    status: str
    purchase_order_id: Optional[int] = None

class ShipmentCreate(ShipmentBase):
    pass

class ShipmentUpdate(ShipmentBase):
    pass

class Shipment(ShipmentBase):
    id: int
    order: Optional[PurchaseOrder] = None # Link back to PO

    class Config:
        from_attributes = True
