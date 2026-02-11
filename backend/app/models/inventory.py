from sqlalchemy import Column, Integer, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.db.base_class import Base

class StoreInventory(Base):
    __tablename__ = "storeinventory"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=False)
    store_id = Column(Integer, ForeignKey("store.id"), nullable=False)
    
    quantity_on_hand = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=10)
    last_restocked = Column(Date)
    
    product = relationship("Product", back_populates="inventory")
    store = relationship("Store", back_populates="inventory")
