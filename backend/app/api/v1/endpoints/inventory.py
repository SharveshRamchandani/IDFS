from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.api import deps
from app import models
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()

class InventoryItem(BaseModel):
    id: int
    product_name: str
    sku: str
    category: str
    availableStock: int
    threshold: int
    status: str # in-stock, low-stock, out-of-stock
    location: str
    lastUpdated: str

@router.get("/", response_model=List[InventoryItem])
def get_inventory(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None
):
    query = db.query(models.StoreInventory).join(models.Product).join(models.Store)
    
    if search:
        query = query.filter(models.Product.sku.ilike(f"%{search}%") | models.Product.name.ilike(f"%{search}%"))
    
    items = query.offset(skip).limit(limit).all()
    
    results = []
    for item in items:
        status = "in-stock"
        if item.quantity_on_hand == 0:
            status = "out-of-stock"
        elif item.quantity_on_hand < item.low_stock_threshold:
            status = "low-stock"
            
        results.append({
            "id": item.id,
            "product_name": item.product.name or f"{item.product.category} Item",
            "sku": item.product.sku,
            "category": item.product.category or "General",
            "availableStock": item.quantity_on_hand,
            "threshold": item.low_stock_threshold,
            "status": status,
            "location": f"{item.store.region} - {item.store.store_id}",
            "lastUpdated": str(item.last_restocked)
        })
    return results

class ProductCreate(BaseModel):
    name: str
    sku: str
    category: str
    store_id: int
    quantity: int
    threshold: int

@router.post("/", response_model=InventoryItem)
def create_product(item_in: ProductCreate, db: Session = Depends(deps.get_db)):
    # 1. Create Product if not exists (simplified logic: check sku first in real app)
    # Check if SKU exists
    existing_product = db.query(models.Product).filter(models.Product.sku == item_in.sku).first()
    if existing_product:
        product = existing_product
        # Optional: update name/category if provided
    else:
        product = models.Product(sku=item_in.sku, name=item_in.name, category=item_in.category)
        db.add(product)
        db.commit()
        db.refresh(product)
    
    # 2. Add to Store Inventory
    # Check if inventory already exists for this product in this store
    inventory = db.query(models.StoreInventory).filter(
        models.StoreInventory.product_id == product.id,
        models.StoreInventory.store_id == item_in.store_id
    ).first()

    if inventory:
        # Update existing inventory
        inventory.quantity_on_hand += item_in.quantity # Add or set? Usually adding stock. Let's assume SET for "create product" context or add? 
        # Actually, "Add Product" usually means "Register new product". 
        # If it exists, maybe we just update stock.
        inventory.quantity_on_hand = item_in.quantity 
        inventory.low_stock_threshold = item_in.threshold
    else:
        inventory = models.StoreInventory(
            product_id=product.id,
            store_id=item_in.store_id,
            quantity_on_hand=item_in.quantity,
            low_stock_threshold=item_in.threshold
        )
        db.add(inventory)
    
    db.commit()
    db.refresh(inventory)
    
    status = "in-stock"
    if inventory.quantity_on_hand == 0:
        status = "out-of-stock"
    elif inventory.quantity_on_hand < inventory.low_stock_threshold:
        status = "low-stock"

    return {
        "id": inventory.id,
        "product_name": product.name or f"{product.category} Item",
        "sku": product.sku,
        "category": product.category,
        "availableStock": inventory.quantity_on_hand,
        "threshold": inventory.low_stock_threshold,
        "status": status,
        "location": "Assigned Store", # Simplified
        "lastUpdated": str(inventory.last_restocked)
    }
