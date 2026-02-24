"""
Data Seeding Script for IDFS
Generates comprehensive realistic data for all tables including Users, Supply Chain, and Forecasts.
"""
import random
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from app.db.session import SessionLocal

from app.models.sales import Product, Store, SalesData, Holiday
from app.models.inventory import StoreInventory
from app.models.user import User, UserRole
from app.models.forecast import Forecast
from app.models.supply_chain import Supplier, SupplierStatus, PurchaseOrder, POStatus, Shipment, ShipmentStatus

from app.crud.crud_user import create as crud_create_user
from app.schemas.user import UserCreate

# Product categories and names
CATEGORIES = {
    "Electronics": ["Laptop", "Smartphone", "Tablet", "Headphones", "Smartwatch", "Camera", "Speaker", "Monitor"],
    "Furniture": ["Sofa", "Chair", "Desk", "Bed", "Wardrobe", "Table", "Shelf", "Cabinet"],
    "Home & Kitchen": ["Blender", "Microwave", "Cookware", "Dishes", "Utensils", "Coffee Maker", "Mixer", "Kettle"],
    "Clothing": ["T-Shirt", "Jeans", "Dress", "Jacket", "Shoes", "Sweater", "Shorts", "Hoodie"],
    "Sports": ["Yoga Mat", "Dumbbells", "Bicycle", "Tennis Racket", "Basketball", "Soccer Ball", "Treadmill", "Weights"],
    "Books": ["Fiction Novel", "Cookbook", "Biography", "Self-Help", "Textbook", "Comic", "Magazine", "Journal"],
    "Toys": ["Action Figure", "Board Game", "Puzzle", "Doll", "Building Blocks", "RC Car", "Plush Toy", "Educational Kit"],
    "Beauty": ["Lipstick", "Foundation", "Perfume", "Shampoo", "Moisturizer", "Face Mask", "Eye Shadow", "Nail Polish"]
}

# Store regions
REGIONS = [
    "North", "South", "East", "West", "Central",
    "Northeast", "Southeast", "Northwest", "Southwest"
]

def create_users(db: Session):
    print("Creating users...")
    roles_map = {
        "admin": "admin",
        "analyst": "inventory_analyst", 
        "manager": "store_manager",
        "warehouse": "staff",
        "customer": "user"
    }
    
    count = 0
    for email_prefix, role_enum in roles_map.items():
        email = f"{email_prefix}@demo.com"
        
        # Skip if user exists
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user_in = UserCreate(
                email=email,
                password=f"{email_prefix}123456", 
                full_name=f"{email_prefix.capitalize()} User",
                role=role_enum,
                is_superuser=(role_enum == "admin")
            )
            crud_create_user(db, user_in)
            count += 1
            
    print(f"✓ Created {count} default users")

def create_products(db: Session, num_products=500):
    """Create diverse product catalog"""
    print(f"Creating {num_products} products...")
    products = []
    
    for i in range(num_products):
        category = random.choice(list(CATEGORIES.keys()))
        product_name = random.choice(CATEGORIES[category])
        sku = f"SKU-{category[:3].upper()}-{i:05d}"
        
        # Price varies by category
        price_ranges = {
            "Electronics": (299, 1999),
            "Furniture": (199, 1499),
            "Home & Kitchen": (29, 299),
            "Clothing": (19, 149),
            "Sports": (39, 599),
            "Books": (9, 49),
            "Toys": (14, 99),
            "Beauty": (12, 89)
        }
        
        min_price, max_price = price_ranges.get(category, (10, 100))
        price = round(random.uniform(min_price, max_price), 2)
        
        product = Product(
            sku=sku,
            name=f"{product_name} {category}",
            category=category,
            price=price
        )
        products.append(product)
    
    db.bulk_save_objects(products)
    db.commit()
    print(f"✓ Created {num_products} products")
    return products

def create_stores(db: Session, num_stores=50):
    """Create store locations"""
    print(f"Creating {num_stores} stores...")
    stores = []
    
    for i in range(num_stores):
        region = random.choice(REGIONS)
        store_id = f"STORE-{region[:3].upper()}-{i:03d}"
        
        store = Store(
            store_id=store_id,
            region=region
        )
        stores.append(store)
    
    db.bulk_save_objects(stores)
    db.commit()
    print(f"✓ Created {num_stores} stores")
    return stores

def create_holidays(db: Session):
    """Create holiday calendar for 2024-2025"""
    print("Creating holiday calendar...")
    holidays = [
        # 2024
        ("2024-01-01", "Holiday", "National", "National", "New Year's Day", False),
        ("2024-02-14", "Event", "National", "National", "Valentine's Day", False),
        ("2024-04-01", "Event", "National", "National", "Easter", False),
        ("2024-07-04", "Holiday", "National", "National", "Independence Day", False),
        ("2024-10-31", "Event", "National", "National", "Halloween", False),
        ("2024-11-28", "Holiday", "National", "National", "Thanksgiving", False),
        ("2024-12-25", "Holiday", "National", "National", "Christmas", False),
        ("2024-12-31", "Event", "National", "National", "New Year's Eve", False),
        # 2025
        ("2025-01-01", "Holiday", "National", "National", "New Year's Day", False),
        ("2025-02-14", "Event", "National", "National", "Valentine's Day", False),
        ("2025-04-20", "Event", "National", "National", "Easter", False),
        ("2025-07-04", "Holiday", "National", "National", "Independence Day", False),
        ("2025-10-31", "Event", "National", "National", "Halloween", False),
        ("2025-11-27", "Holiday", "National", "National", "Thanksgiving", False),
        ("2025-12-25", "Holiday", "National", "National", "Christmas", False),
    ]
    
    holiday_objects = []
    for date_str, h_type, locale, locale_name, desc, transferred in holidays:
        holiday = Holiday(
            date=datetime.strptime(date_str, "%Y-%m-%d").date(),
            type=h_type,
            locale=locale,
            locale_name=locale_name,
            description=desc,
            transferred=transferred
        )
        holiday_objects.append(holiday)
    
    db.bulk_save_objects(holiday_objects)
    db.commit()
    print(f"✓ Created {len(holidays)} holidays")

def is_holiday(date, holidays_set):
    """Check if date is a holiday"""
    return date in holidays_set

def create_suppliers_pos_shipments(db: Session, num_suppliers=20, num_pos=100):
    print(f"Creating {num_suppliers} suppliers, {num_pos} purchase orders, and shipments...")
    
    # 1. Suppliers
    suppliers = []
    statuses = [SupplierStatus.ACTIVE, SupplierStatus.INACTIVE, SupplierStatus.UNDER_REVIEW]
    company_names = ["Global Logistics", "ProGoods", "TechSupply", "Furniture Direct", "WorldWide Imports", "Prime Source"]
    
    for i in range(num_suppliers):
        supplier = Supplier(
            name=f"{random.choice(company_names)} Co {i}",
            contact_person=f"Contact {i}",
            email=f"contact{i}@supplier.com",
            phone=f"555-01{i:02d}",
            rating=round(random.uniform(2.5, 5.0), 1),
            status=random.choice(statuses)
        )
        db.add(supplier)
    db.commit()
    
    created_suppliers = db.query(Supplier).all()
    
    # 2. Purchase Orders
    pos = []
    po_statuses = [POStatus.PENDING, POStatus.APPROVED, POStatus.PROCESSING, POStatus.DELIVERED, POStatus.CANCELLED]
    
    for i in range(num_pos):
        po = PurchaseOrder(
            po_number=f"PO-2024-{i:05d}",
            supplier_id=random.choice(created_suppliers).id,
            order_date=datetime.now().date() - timedelta(days=random.randint(1, 100)),
            total_amount=round(random.uniform(500, 50000), 2),
            status=random.choice(po_statuses)
        )
        db.add(po)
        pos.append(po)
    db.commit()
    
    # 3. Shipments
    shipment_statuses = [ShipmentStatus.PENDING, ShipmentStatus.IN_TRANSIT, ShipmentStatus.ARRIVED, ShipmentStatus.DELAYED, ShipmentStatus.CUSTOMS, ShipmentStatus.DELIVERED]
    carriers = ["FedEx", "DHL", "UPS", "Maersk", "Evergreen"]
    modes = ["Air", "Sea", "Land"]
    
    for po in pos:
        # Generate shipments for orders not just pending or cancelled
        if po.status in [POStatus.APPROVED, POStatus.PROCESSING, POStatus.DELIVERED]:
            eta_date = po.order_date + timedelta(days=random.randint(5, 30))
            shipment = Shipment(
                tracking_number=f"TRK-{random.randint(100000, 999999)}-{po.id}",
                origin="Guangzhou",
                destination="New York",
                eta=eta_date,
                carrier=random.choice(carriers),
                mode=random.choice(modes),
                status=random.choice(shipment_statuses),
                purchase_order_id=po.id
            )
            db.add(shipment)
    db.commit()
    
    print(f"✓ Created {num_suppliers} suppliers and {num_pos} POs with their shipments")

def create_forecasts(db: Session, num_records=200):
    print(f"Creating {num_records} generic forecast records...")
    forecasts = []
    
    base_date = datetime.now().date()
    for i in range(num_records):
        forecast_date = base_date + timedelta(days=i)
        pred_val = random.uniform(1000, 5000)
        forecasts.append(Forecast(
            forecast_date=forecast_date,
            predicted_value=pred_val,
            lower_bound=pred_val * 0.8,
            upper_bound=pred_val * 1.2,
            model_version="1.0"
        ))
    db.bulk_save_objects(forecasts)
    db.commit()
    print(f"✓ Created {num_records} forecast records")

def create_sales_data(db: Session, products, stores, num_records=100000):
    """Generate realistic sales data with seasonality and trends"""
    print(f"Generating {num_records} sales records...")
    
    # Get holidays
    holidays = db.query(Holiday).all()
    holiday_dates = {h.date for h in holidays}
    
    # Date range: Last 2 years up to TODAY (no future dates)
    end_date = datetime.now().date()  # TODAY - no future sales
    start_date = end_date - timedelta(days=730)  # 2 years of history
    
    print(f"  Date Range: {start_date} to {end_date} (TODAY)")
    
    sales_data = []
    batch_size = 5000
    
    for i in range(num_records):
        # Random date in range
        days_offset = random.randint(0, (end_date - start_date).days)
        sale_date = start_date + timedelta(days=days_offset)
        
        # Pick random product and store
        product = random.choice(products)
        store = random.choice(stores)
        
        # Base quantity influenced by product category
        category_demand = {
            "Electronics": (1, 5),
            "Furniture": (1, 3),
            "Home & Kitchen": (1, 8),
            "Clothing": (1, 10),
            "Sports": (1, 6),
            "Books": (1, 12),
            "Toys": (1, 8),
            "Beauty": (1, 15)
        }
        
        min_qty, max_qty = category_demand.get(product.category, (1, 5))
        base_quantity = random.randint(min_qty, max_qty)
        
        # Seasonality effects
        month = sale_date.month
        day_of_week = sale_date.weekday()
        
        # Weekend boost
        if day_of_week >= 5:  # Saturday, Sunday
            base_quantity = int(base_quantity * random.uniform(1.2, 1.8))
        
        # Holiday boost
        if is_holiday(sale_date, holiday_dates):
            base_quantity = int(base_quantity * random.uniform(2.0, 4.0))
            on_promotion = random.random() < 0.7  # 70% promotion during holidays
        else:
            on_promotion = random.random() < 0.15  # 15% normal promotion rate
        
        # Promotional boost
        if on_promotion:
            base_quantity = int(base_quantity * random.uniform(1.5, 2.5))
        
        # Seasonal patterns
        if product.category == "Electronics":
            if month == 11: # Black Friday
                base_quantity = int(base_quantity * random.uniform(2.0, 3.0))
        elif product.category == "Toys":
            if month in [11, 12]: # Christmas
                base_quantity = int(base_quantity * random.uniform(2.5, 4.0))
        elif product.category == "Clothing":
            if month in [8, 9]: # Back to school
                base_quantity = int(base_quantity * random.uniform(1.5, 2.0))
        elif product.category == "Sports":
            if month in [5, 6, 7, 8]: # Summer
                base_quantity = int(base_quantity * random.uniform(1.3, 2.0))
        
        quantity = max(1, int(base_quantity * random.uniform(0.8, 1.3)))
        
        sale = SalesData(
            date=sale_date,
            sku_id=product.id,
            store_id=store.id,
            quantity=quantity,
            onpromotion=on_promotion
        )
        sales_data.append(sale)
        
        if len(sales_data) >= batch_size:
            db.bulk_save_objects(sales_data)
            db.commit()
            print(f"  → Inserted {i+1}/{num_records} sales records...")
            sales_data = []
    
    if sales_data:
        db.bulk_save_objects(sales_data)
        db.commit()
    
    print(f"✓ Created {num_records} sales records")

def create_inventory(db: Session, products, stores):
    """Create initial inventory for all product-store combinations"""
    print(f"Creating inventory records...")
    
    inventory_data = []
    batch_size = 1000
    count = 0
    
    for store in stores:
        # Each store carries 60-80% of products
        num_products_in_store = int(len(products) * random.uniform(0.6, 0.8))
        store_products = random.sample(products, num_products_in_store)
        
        for product in store_products:
            stock_levels = {
                "Electronics": (5, 50),
                "Furniture": (3, 20),
                "Home & Kitchen": (10, 100),
                "Clothing": (20, 200),
                "Sports": (5, 60),
                "Books": (10, 150),
                "Toys": (15, 120),
                "Beauty": (20, 150)
            }
            
            min_stock, max_stock = stock_levels.get(product.category, (5, 50))
            quantity = random.randint(min_stock, max_stock)
            
            low_stock_threshold = int(random.uniform(0.2, 0.3) * max_stock)
            
            days_ago = random.randint(1, 30)
            last_restocked = datetime.now().date() - timedelta(days=days_ago)
            
            inventory = StoreInventory(
                product_id=product.id,
                store_id=store.id,
                quantity_on_hand=quantity,
                low_stock_threshold=low_stock_threshold,
                last_restocked=last_restocked
            )
            inventory_data.append(inventory)
            count += 1
            
            if len(inventory_data) >= batch_size:
                db.bulk_save_objects(inventory_data)
                db.commit()
                print(f"  → Created {count} inventory records...")
                inventory_data = []
    
    if inventory_data:
        db.bulk_save_objects(inventory_data)
        db.commit()
    
    print(f"✓ Created {count} inventory records")

def main():
    """Main seeding function"""
    print("=" * 60)
    print("IDFS Data Seeding Script (ALL TABLES)")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        # Clear existing data (optional - comment out to keep existing data)
        print("\nClearing existing data...")
        # Since of foreign key constraints, delete in a specific order:
        db.query(SalesData).delete()
        db.query(StoreInventory).delete()
        db.query(Product).delete()
        db.query(Store).delete()
        db.query(Holiday).delete()
        db.query(Shipment).delete()
        db.query(PurchaseOrder).delete()
        db.query(Supplier).delete()
        db.query(Forecast).delete()
        # We optionally delete or leave users, let's leave users if they already exist so we don't break logins
        # db.query(User).delete()  
        db.commit()
        print("✓ Cleared existing data")
        
        # Create base data
        print("\n" + "=" * 60)
        create_users(db)

        print("\n" + "=" * 60)
        products_list = create_products(db, num_products=500)
        
        print("\n" + "=" * 60)
        stores_list = create_stores(db, num_stores=50)
        
        print("\n" + "=" * 60)
        create_holidays(db)

        print("\n" + "=" * 60)
        create_suppliers_pos_shipments(db, num_suppliers=20, num_pos=100)

        print("\n" + "=" * 60)
        create_forecasts(db, num_records=200)
        
        # Get all products and stores with IDs from database
        products = db.query(Product).all()
        stores = db.query(Store).all()
        
        # Create sales data
        print("\n" + "=" * 60)
        create_sales_data(db, products, stores, num_records=100000)
        
        # Create inventory
        print("\n" + "=" * 60)
        create_inventory(db, products, stores)
        
        print("\n" + "=" * 60)
        print("✅ DATA SEEDING COMPLETE!")
        print("=" * 60)
        print(f"Summary:")
        print(f"  • Custom Users generated")
        print(f"  • Products: {len(products)}")
        print(f"  • Stores: {len(stores)}")
        print(f"  • Suppliers: 20")
        print(f"  • Purchase Orders: 100 (along with tracking shipments)")
        print(f"  • Forecast Records: 200")
        print(f"  • Sales Records: ~100,000")
        print(f"  • Inventory Records: ~{len(products) * len(stores) * 0.7:.0f}")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
