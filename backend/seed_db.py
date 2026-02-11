from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.crud.crud_user import create
from app.schemas.user import UserCreate
from app.models import Product, Store, StoreInventory, Supplier, PurchaseOrder, Shipment
from app.models.supply_chain import SupplierStatus, POStatus, ShipmentStatus
import random
from datetime import date, timedelta

def seed_db():
    db = SessionLocal()
    try:
        # 1. Create Users
        print("👤 Creating Users...")
        roles = ["admin", "analyst", "manager", "warehouse"]
        for role in roles:
            email = f"{role}@ikea.com"
            user_in = UserCreate(
                email=email,
                password=f"{role}123456", # meets min length 8
                full_name=f"{role.capitalize()} User",
                role=role,
                is_superuser=(role == "admin")
            )
            # Check if exists
            from app.models.user import User
            user = db.query(User).filter(User.email == user_in.email).first()
            if not user:
                create(db, user_in)
                print(f"   Created {role} user.")

        # 2. Create Products (if not exist)
        print("📦 Creating Products & Inventory...")
        products_data = [
            {"sku": "SKU-001234", "name": "KALLAX Shelf Unit", "category": "Storage", "price": 79.99},
            {"sku": "SKU-002345", "name": "MALM Bed Frame", "category": "Bedroom", "price": 149.00},
            {"sku": "SKU-003456", "name": "LACK Side Table", "category": "Living Room", "price": 12.99},
            {"sku": "SKU-004567", "name": "BILLY Bookcase", "category": "Storage", "price": 49.99},
            {"sku": "SKU-005678", "name": "EKTORP Sofa", "category": "Living Room", "price": 399.00},
            {"sku": "SKU-006789", "name": "MICKE Desk", "category": "Office", "price": 89.00},
            {"sku": "SKU-007890", "name": "PAX Wardrobe", "category": "Bedroom", "price": 249.00},
            {"sku": "SKU-008901", "name": "POÄNG Armchair", "category": "Living Room", "price": 199.00},
            {"sku": "SKU-009012", "name": "HEMNES Shoe Cabinet", "category": "Storage", "price": 59.00},
            {"sku": "SKU-010123", "name": "STOCKHOLM Rug", "category": "Living Room", "price": 399.00},
        ]
        
        db_products = []
        for p in products_data:
            obj = db.query(Product).filter(Product.sku == p["sku"]).first()
            if not obj:
                obj = Product(**p)
                db.add(obj)
                db.commit()
                db.refresh(obj)
            db_products.append(obj)

        # 3. Create Stores
        print("🏪 Creating Stores...")
        db_stores = []
        for i in range(1, 4):
            store_id = f"ST-00{i}"
            obj = db.query(Store).filter(Store.store_id == store_id).first()
            if not obj:
                obj = Store(store_id=store_id, region="North")
                db.add(obj)
                db.commit()
                db.refresh(obj)
            db_stores.append(obj)

        # 4. Create Inventory (Product x Store)
        for store in db_stores:
            for product in db_products:
                inv = db.query(StoreInventory).filter(
                    StoreInventory.store_id == store.id,
                    StoreInventory.product_id == product.id
                ).first()
                if not inv:
                    inv = StoreInventory(
                        store_id=store.id,
                        product_id=product.id,
                        quantity_on_hand=random.randint(0, 300),
                        low_stock_threshold=random.randint(20, 50),
                        last_restocked=date.today() - timedelta(days=random.randint(0, 30))
                    )
                    db.add(inv)
        db.commit()

        # 5. Create Suppliers
        print("🚚 Creating Suppliers...")
        suppliers_data = [
            {"name": "Global Woods Ltd", "contact": "John Doe", "email": "john@woods.com", "status": SupplierStatus.ACTIVE},
            {"name": "Fabrics & Co", "contact": "Jane Smith", "email": "jane@fabrics.com", "status": SupplierStatus.ACTIVE},
            {"name": "Meta Metals", "contact": "Mike Iron", "email": "mike@metal.com", "status": SupplierStatus.UNDER_REVIEW},
            {"name": "Plastic Fantastic", "contact": "Sarah Poly", "email": "sarah@plastic.com", "status": SupplierStatus.INACTIVE},
        ]
        db_suppliers = []
        for s in suppliers_data:
            obj = db.query(Supplier).filter(Supplier.name == s["name"]).first()
            if not obj:
                obj = Supplier(
                    name=s["name"],
                    contact_person=s["contact"],
                    email=s["email"],
                    status=s["status"],
                    rating=round(random.uniform(3.0, 5.0), 1)
                )
                db.add(obj)
                db.commit()
                db.refresh(obj)
            db_suppliers.append(obj)

        # 6. Create Purchase Orders & Shipments
        print("📜 Creating POs and Shipments...")
        statuses = [POStatus.PENDING, POStatus.APPROVED, POStatus.PROCESSING, POStatus.DELIVERED]
        
        for i in range(15):
            po_num = f"PO-2024-{100+i}"
            exists = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_num).first()
            if not exists:
                supplier = random.choice(db_suppliers)
                po_status = random.choice(statuses)
                po = PurchaseOrder(
                    po_number=po_num,
                    supplier_id=supplier.id,
                    order_date=date.today() - timedelta(days=random.randint(1, 60)),
                    total_amount=random.randint(1000, 50000),
                    status=po_status
                )
                db.add(po)
                db.commit()
                db.refresh(po)

                # Create Shipment if Processing or Delivered
                if po_status in [POStatus.PROCESSING, POStatus.DELIVERED]:
                    ship_status = ShipmentStatus.ARRIVED if po_status == POStatus.DELIVERED else ShipmentStatus.IN_TRANSIT
                    shipment = Shipment(
                        tracking_number=f"TRK-{random.randint(10000,99999)}",
                        origin="Shanghai",
                        destination="Stockholm",
                        eta=date.today() + timedelta(days=random.randint(5, 20)),
                        carrier=random.choice(["Maersk", "DHL", "FedEx"]),
                        mode=random.choice(["Sea", "Air"]),
                        status=ship_status,
                        purchase_order_id=po.id
                    )
                    db.add(shipment)
        db.commit()

        # 7. Seed Sales Data (History)
        print("📈 Seeding Historical Sales Data (This might take a moment)...")
        from app.models.sales import SalesData
        
        # Check if sales data already exists to avoid duplication
        sales_count = db.query(SalesData).count()
        if sales_count < 100:
            start_date = date.today() - timedelta(days=365)
            sales_entries = []
            
            for day_offset in range(366):
                current_date = start_date + timedelta(days=day_offset)
                
                # Simple seasonality affect (sine wave-ish or random spikes)
                is_weekend = current_date.weekday() >= 5
                season_factor = 1.0 + (0.2 if is_weekend else 0.0)
                
                for store in db_stores:
                    for product in db_products:
                        # Base demand based on price (cheaper = more volume)
                        base_demand = max(1, int(1000 / product.price)) 
                        # Randomize
                        qty = int(random.gauss(base_demand, base_demand * 0.3) * season_factor)
                        qty = max(0, qty)
                        
                        sales_entry = SalesData(
                            date=current_date,
                            sku_id=product.id,
                            store_id=store.id,
                            quantity=qty,
                            onpromotion=random.random() > 0.9 # 10% chance of promotion
                        )
                        sales_entries.append(sales_entry)
                
                if len(sales_entries) > 1000:
                    db.add_all(sales_entries)
                    db.commit()
                    sales_entries = []
            
            if sales_entries:
                db.add_all(sales_entries)
                db.commit()
            print("✅ Added ~10,000 sales records.")
        else:
            print("ℹ️ Sales data already exists, skipping seed.")

        print("✅ Database seeding completed successfully!")
            
    except Exception as e:
        print(f"❌ Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
