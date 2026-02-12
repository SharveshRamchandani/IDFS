from app.db.session import SessionLocal
from app.models import User, Product, Store, StoreInventory, Supplier, PurchaseOrder, Shipment
from app.models.sales import SalesData
from sqlalchemy import text

def check_counts():
    try:
        print("[*] Current Database Counts:")
        from app.db.session import SessionLocal
        db = SessionLocal()
        
        print(f"   - Users: {db.query(User).count()}")
        print(f"   - Products: {db.query(Product).count()}")
        print(f"   - Stores: {db.query(Store).count()}")
        print(f"   - Inventory Items: {db.query(StoreInventory).count()}")
        print(f"   - Suppliers: {db.query(Supplier).count()}")
        print(f"   - Purchase Orders: {db.query(PurchaseOrder).count()}")
        print(f"   - Shipments: {db.query(Shipment).count()}")
        print(f"   - Sales Records: {db.query(SalesData).count()}")
        
        dead_stock = db.query(Product).filter(Product.name == "LACK Side Table").first()
        if dead_stock:
            sales = db.query(SalesData).filter(SalesData.sku_id == dead_stock.id).count()
            print(f"   - Sales for Dead Stock Item '{dead_stock.name}': {sales}")
            
    except Exception as e:
        print(f"[!] Error checking DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_counts()
