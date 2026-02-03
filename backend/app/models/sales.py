from sqlalchemy import Column, Integer, String, Float, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class Product(Base):
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    category = Column(String, index=True)
    price = Column(Float)
    
    sales = relationship("SalesData", back_populates="product")

class Store(Base):
    id = Column(Integer, primary_key=True, index=True)
    store_id = Column(String, unique=True, index=True, nullable=False)
    region = Column(String, index=True)
    
    sales = relationship("SalesData", back_populates="store")

class SalesData(Base):
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True, nullable=False)
    sku_id = Column(Integer, ForeignKey("product.id"))
    store_id = Column(Integer, ForeignKey("store.id"))
    quantity = Column(Integer, nullable=False)
    
    product = relationship("Product", back_populates="sales")
    store = relationship("Store", back_populates="sales")
