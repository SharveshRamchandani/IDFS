"""
Live Data Simulator for IDFS
Updates sales and inventory data every 10 seconds to simulate real-time activity
Perfect for project demonstrations!
"""
import random
import time
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import SessionLocal
from app.models.sales import Product, Store, SalesData, Holiday
from app.models.inventory import StoreInventory

class LiveDataSimulator:
    def __init__(self, db: Session):
        self.db = db
        self.products = db.query(Product).all()
        self.stores = db.query(Store).all()
        self.holidays = {h.date for h in db.query(Holiday).all()}
        
        if not self.products or not self.stores:
            raise ValueError("No products or stores found. Please run seed_data.py first!")
        
        print(f"📊 Simulator initialized with {len(self.products)} products and {len(self.stores)} stores")
    
    def add_new_sales(self, num_sales=50):
        """Add new sales records with realistic patterns"""
        today = datetime.now().date()
        current_hour = datetime.now().hour
        day_of_week = today.weekday()
        
        # Time-based multiplier (more sales during business hours)
        if 9 <= current_hour <= 21:
            time_multiplier = random.uniform(1.2, 2.0)
        else:
            time_multiplier = random.uniform(0.3, 0.8)
        
        # Weekend boost
        if day_of_week >= 5:
            time_multiplier *= random.uniform(1.3, 1.7)
        
        # Holiday boost
        if today in self.holidays:
            time_multiplier *= random.uniform(2.0, 3.5)
        
        sales = []
        for _ in range(int(num_sales * time_multiplier)):
            product = random.choice(self.products)
            store = random.choice(self.stores)
            
            # Realistic quantity based on category
            category_qty = {
                "Electronics": (1, 3),
                "Furniture": (1, 2),
                "Home & Kitchen": (1, 5),
                "Clothing": (1, 8),
                "Sports": (1, 4),
                "Books": (1, 10),
                "Toys": (1, 6),
                "Beauty": (1, 12)
            }
            
            min_qty, max_qty = category_qty.get(product.category, (1, 5))
            quantity = random.randint(min_qty, max_qty)
            
            # 20% chance of promotion
            on_promotion = random.random() < 0.2
            if on_promotion:
                quantity = int(quantity * random.uniform(1.5, 2.5))
            
            sale = SalesData(
                date=today,
                sku_id=product.id,
                store_id=store.id,
                quantity=quantity,
                onpromotion=on_promotion
            )
            sales.append(sale)
        
        self.db.bulk_save_objects(sales)
        self.db.commit()
        return len(sales)
    
    def update_inventory(self, num_updates=30):
        """Simulate inventory changes (sales reducing stock, restocking, etc.)"""
        # Get random inventory records
        inventory_records = self.db.query(StoreInventory).order_by(func.random()).limit(num_updates).all()
        
        updates = {"restocked": 0, "sold": 0, "low_stock": 0}
        
        for inv in inventory_records:
            action = random.choices(
                ["restock", "sell", "adjust"],
                weights=[0.3, 0.6, 0.1],
                k=1
            )[0]
            
            if action == "restock":
                # Restock items
                restock_amount = random.randint(10, 100)
                inv.quantity_on_hand += restock_amount
                inv.last_restocked = datetime.now().date()
                updates["restocked"] += 1
                
            elif action == "sell":
                # Reduce inventory (simulate sales)
                sold_amount = random.randint(1, min(10, inv.quantity_on_hand))
                inv.quantity_on_hand = max(0, inv.quantity_on_hand - sold_amount)
                
                if inv.quantity_on_hand <= inv.low_stock_threshold:
                    updates["low_stock"] += 1
                updates["sold"] += 1
                
            else:
                # Random adjustment
                adjustment = random.randint(-5, 5)
                inv.quantity_on_hand = max(0, inv.quantity_on_hand + adjustment)
        
        self.db.commit()
        return updates
    
    def simulate_product_trends(self):
        """Simulate trending products (price changes, demand spikes)"""
        # Pick 3-5 random products for price adjustments
        trending_products = random.sample(self.products, random.randint(3, 5))
        
        for product in trending_products:
            # Small price fluctuation (±5%)
            price_change = random.uniform(-0.05, 0.05)
            product.price = round(product.price * (1 + price_change), 2)
        
        self.db.commit()
        return len(trending_products)
    
    def display_stats(self):
        """Display current database statistics"""
        total_sales = self.db.query(func.count(SalesData.id)).scalar()
        total_inventory = self.db.query(func.count(StoreInventory.id)).scalar()
        low_stock_items = self.db.query(StoreInventory).filter(
            StoreInventory.quantity_on_hand <= StoreInventory.low_stock_threshold
        ).count()
        
        today_sales = self.db.query(func.count(SalesData.id)).filter(
            SalesData.date == datetime.now().date()
        ).scalar()
        
        print(f"\n{'='*60}")
        print(f"📈 DATABASE STATS (as of {datetime.now().strftime('%Y-%m-%d %H:%M:%S')})")
        print(f"{'='*60}")
        print(f"  📦 Total Sales Records: {total_sales:,}")
        print(f"  🛍️  Today's Sales: {today_sales:,}")
        print(f"  📊 Inventory Items: {total_inventory:,}")
        print(f"  ⚠️  Low Stock Alerts: {low_stock_items}")
        print(f"{'='*60}\n")

def main():
    """Main simulation loop"""
    print("=" * 60)
    print("🔴 LIVE DATA SIMULATOR - IDFS")
    print("=" * 60)
    print("This script simulates real-time data changes at RANDOM intervals")
    print("Purchase times: Every 5-15 seconds (randomized)")
    print("Perfect for project demonstrations!")
    print("\nPress Ctrl+C to stop the simulation")
    print("=" * 60)
    
    db = SessionLocal()
    
    try:
        simulator = LiveDataSimulator(db)
        simulator.display_stats()
        
        iteration = 1
        
        while True:
            # Random wait time between 5 and 15 seconds for realistic timing
            wait_time = random.randint(5, 30)
            
            print(f"\n🔄 Iteration #{iteration} - {datetime.now().strftime('%H:%M:%S')}")
            print("-" * 60)
            
            # Random number of sales per iteration (30-80)
            num_sales_this_round = random.randint(30, 80)
            
            # Add new sales
            num_sales = simulator.add_new_sales(num_sales=num_sales_this_round)
            print(f"  ✅ Added {num_sales} new sales records")
            
            # Random inventory updates (20-50)
            num_inv_updates = random.randint(20, 50)
            inv_updates = simulator.update_inventory(num_updates=num_inv_updates)
            print(f"  📦 Inventory updates:")
            print(f"     • Restocked: {inv_updates['restocked']} items")
            print(f"     • Sold: {inv_updates['sold']} items")
            print(f"     • Low stock warnings: {inv_updates['low_stock']} items")
            
            # Simulate trends
            trending = simulator.simulate_product_trends()
            print(f"  📊 Price adjusted for {trending} trending products")
            
            # Show stats every 5 iterations
            if iteration % 5 == 0:
                simulator.display_stats()
            
            iteration += 1
            
            print(f"\n⏱️  Next update in {wait_time} seconds (randomized)...")
            time.sleep(wait_time)
            
    except KeyboardInterrupt:
        print("\n\n" + "=" * 60)
        print("🛑 Simulation stopped by user")
        simulator.display_stats()
        print("=" * 60)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()
