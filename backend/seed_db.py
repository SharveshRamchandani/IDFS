from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.crud.crud_user import create
from app.schemas.user import UserCreate
from app.models import Product, Store, StoreInventory, Supplier, PurchaseOrder, Shipment
from app.models.supply_chain import SupplierStatus, POStatus, ShipmentStatus
import random
from datetime import date, timedelta

def log(msg):
    try:
        print(msg)
    except UnicodeEncodeError:
        print(msg.encode('ascii', 'replace').decode())
    
    with open("seed_log.txt", "a", encoding="utf-8") as f:
        f.write(str(msg) + "\n")

def seed_db():
    try:
        log(">>> Starting DB Seed...")
        db = SessionLocal()
    except Exception as e:
        log(f"!!! Failed to init SessionLocal: {e}")
        return

    try:
        # 1. Create Users
        log("--- Creating Users...")
        roles_map = {
            "admin": "admin",
            "analyst": "inventory_analyst", 
            "manager": "store_manager",
            "warehouse": "staff"
        }
        
        for email_prefix, role_enum in roles_map.items():
            email = f"{email_prefix}@ikea.com"
            
            # Skip if user exists
            from app.models.user import User
            user = db.query(User).filter(User.email == email).first()
            if not user:
                user_in = UserCreate(
                    email=email,
                    password=f"{email_prefix}123456", 
                    full_name=f"{email_prefix.capitalize()} User",
                    role=role_enum,
                    is_superuser=(role_enum == "admin")
                )
                create(db, user_in)
                log(f"   Created {role_enum} user ({email}).")

        # 2. Create Products (if not exist)
        log("(box) Creating Products & Inventory...")
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
        log("(store) Creating Stores...")
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
        log("(truck) Creating Suppliers...")
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
        log("(scroll) Creating POs and Shipments...")
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
        log("(chart) Seeding Historical Sales Data (This might take a moment)...")
        from app.models.sales import SalesData
        
        if True: # Force re-seed for ML testing
            log("(!) Clearning existing sales data...")
            db.query(SalesData).delete()
            db.commit()
            
            start_date = date.today() - timedelta(days=730)
            sales_entries = []
            
            # Identify specific products for scenarios
            dead_stock_product = db.query(Product).filter(Product.name == "LACK Side Table").first()
            seasonal_product = db.query(Product).filter(Product.name == "EKTORP Sofa").first()
            
            # Dead Stock Cutoff: Stopped selling 150 days ago
            dead_stock_cutoff = date.today() - timedelta(days=150)
            
            print(f"   - Dead Stock Candidate: {dead_stock_product.name} (Stops selling after {dead_stock_cutoff})")
            
            for day_offset in range(731):
                current_date = start_date + timedelta(days=day_offset)
                
                # Seasonality: Stronger sales in Nov/Dec (Month 11, 12)
                month = current_date.month
                is_holiday_season = month in [11, 12]
                
                # Weekly seasonality: Weekend spikes
                is_weekend = current_date.weekday() >= 5
                
                for product in db_products:
                    # SCENARIO 1: Dead Stock
                    if product.id == dead_stock_product.id and current_date > dead_stock_cutoff:
                        continue # No sales for this product after cutoff
                        
                    # SCENARIO 2: Seasonal Product (High variance)
                    is_seasonal_item = (product.id == seasonal_product.id)
                    
                    # Base factors
                    season_factor = 1.0
                    if is_holiday_season:
                        season_factor *= 1.5 if is_seasonal_item else 1.2
                    if is_weekend:
                        season_factor *= 1.3
                        
                    # Base demand calculation
                    base_demand = max(1, int(2000 / product.price)) 
                    
                    # Random noise
                    import math
                    # Add a trend component (sales increase slightly over time)
                    trend = 1.0 + (day_offset / 730.0) * 0.2 
                    
                    mu = base_demand * season_factor * trend
                    sigma = mu * 0.3
                    
                    qty = int(random.normalvariate(mu, sigma))
                    qty = max(0, qty)
                    
                    # Store loop - generate for all stores
                    for store in db_stores:
                        # Introduce store variability
                        store_factor = 1.0 if store.region == "North" else 0.8
                        store_qty = max(0, int(qty * store_factor))
                        
                        # Randomly skip some days for realistic sparsity
                        if random.random() > 0.95: 
                            store_qty = 0
                            
                        if store_qty > 0:
                            sales_entry = SalesData(
                                date=current_date,
                                sku_id=product.id,
                                store_id=store.id,
                                quantity=store_qty,
                                onpromotion=(random.random() > 0.9)
                            )
                            sales_entries.append(sales_entry)
                
                # Batch insert every 30 days of data to keep memory usage low
                if len(sales_entries) > 5000:
                    db.bulk_save_objects(sales_entries)
                    db.commit()
                    sales_entries = []
            
            if sales_entries:
                db.bulk_save_objects(sales_entries)
                db.commit()
            log("(tick) Added sales records.")
            
            # Update Inventory to reflect "Dead Stock" reality
            # Dead stock item should have HIGH inventory but NO recent sales
            dead_inv = db.query(StoreInventory).filter(StoreInventory.product_id == dead_stock_product.id).all()
            for inv in dead_inv:
                inv.quantity_on_hand = 150 # High stock
                inv.last_restocked = dead_stock_cutoff - timedelta(days=20) # Old stock
            db.commit()
            
        else:
            log("(i) Sales data already exists, skipping seed.")

        log("(tick) Database seeding completed successfully!")
            
    except Exception as e:
        log(f"(x) Error seeding DB: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
