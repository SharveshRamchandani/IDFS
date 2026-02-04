from typing import List, Optional
from datetime import date
from pydantic import BaseModel

# Product Schemas
class ProductBase(BaseModel):
    sku: str
    category: Optional[str] = None
    price: Optional[float] = None

class ProductCreate(ProductBase):
    pass

class Product(ProductBase):
    id: int

    class Config:
        from_attributes = True

# Store Schemas
class StoreBase(BaseModel):
    store_id: str
    region: Optional[str] = None

class StoreCreate(StoreBase):
    pass

class Store(StoreBase):
    id: int

    class Config:
        from_attributes = True

# SalesData Schemas
class SalesDataBase(BaseModel):
    date: date
    quantity: int

class SalesDataCreate(SalesDataBase):
    sku: str # Reference by SKU
    store_id: str # Reference by Store ID

class SalesData(SalesDataBase):
    id: int
    sku_id: int
    store_id: int

    class Config:
        from_attributes = True
