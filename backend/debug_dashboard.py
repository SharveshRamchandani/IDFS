import sys
import os

# Add the current directory to sys.path to allow imports from app
sys.path.append(os.getcwd())

from app.db.session import SessionLocal
from app.crud import crud_sales
from sqlalchemy import text

def debug_dashboard():
    db = SessionLocal()
    try:
        print("Checking connection...")
        db.execute(text("SELECT 1"))
        print("Connection OK.")

        print("Testing get_total_products_count...")
        print(crud_sales.get_total_products_count(db))

        print("Testing get_total_stores_count...")
        print(crud_sales.get_total_stores_count(db))

        print("Testing get_total_sales_count...")
        print(crud_sales.get_total_sales_count(db))

        print("Testing get_total_revenue...")
        try:
            print(crud_sales.get_total_revenue(db))
        except Exception as e:
            print(f"FAILED get_total_revenue: {e}")

        print("Testing get_avg_daily_sales...")
        try:
            print(crud_sales.get_avg_daily_sales(db))
        except Exception as e:
            print(f"FAILED get_avg_daily_sales: {e}")

        print("Testing get_top_stores...")
        try:
            print(crud_sales.get_top_stores(db))
        except Exception as e:
            print(f"FAILED get_top_stores: {e}")

    except Exception as e:
        print(f"General Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    debug_dashboard()
