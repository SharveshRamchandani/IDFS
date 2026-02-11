from sqlalchemy import Column, Integer, String, Float, Date, Enum, ForeignKey
from sqlalchemy.orm import relationship
import enum
from app.db.base_class import Base

class SupplierStatus(str, enum.Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"
    UNDER_REVIEW = "Under Review"

class POStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    PROCESSING = "Processing"
    DELIVERED = "Delivered"
    CANCELLED = "Cancelled"

class ShipmentStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_TRANSIT = "In Transit"
    ARRIVED = "Arrived"
    DELAYED = "Delayed"
    CUSTOMS = "Customs"
    DELIVERED = "Delivered"

class Supplier(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    contact_person = Column(String)
    email = Column(String, index=True)
    phone = Column(String)
    rating = Column(Float, default=0.0)
    status = Column(String, default=SupplierStatus.ACTIVE)

    orders = relationship("PurchaseOrder", back_populates="supplier")

class PurchaseOrder(Base):
    id = Column(Integer, primary_key=True, index=True)
    po_number = Column(String, unique=True, index=True) # e.g., PO-2023-001
    supplier_id = Column(Integer, ForeignKey("supplier.id"))
    order_date = Column(Date)
    total_amount = Column(Float)
    status = Column(String, default=POStatus.PENDING)

    supplier = relationship("Supplier", back_populates="orders")
    shipment = relationship("Shipment", back_populates="order", uselist=False)

class Shipment(Base):
    id = Column(Integer, primary_key=True, index=True)
    tracking_number = Column(String, unique=True, index=True)
    origin = Column(String)
    destination = Column(String)
    eta = Column(Date)
    carrier = Column(String)
    mode = Column(String) # Sea, Air, Land
    status = Column(String, default=ShipmentStatus.PENDING)
    purchase_order_id = Column(Integer, ForeignKey("purchaseorder.id"), nullable=True)

    order = relationship("PurchaseOrder", back_populates="shipment")
