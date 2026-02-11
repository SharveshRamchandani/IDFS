from app.db.session import SessionLocal
from sqlalchemy import text

def check_counts():
    db = SessionLocal()
    tables = ["user", "product", "store", "storeinventory", "supplier", "purchaseorder", "shipment", "salesdata"]
    
    print(f"{'Table':<20} | {'Count':<10}")
    print("-" * 33)
    
    for table in tables:
        try:
            count = db.execute(text(f"SELECT COUNT(*) FROM {table}")).scalar()
            print(f"{table:<20} | {count:<10}")
        except Exception as e:
            db.rollback()
            print(f"{table:<20} | Error: {e}")
    
    db.close()

if __name__ == "__main__":
    check_counts()
