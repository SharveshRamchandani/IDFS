import sys
import os

# Ensure the backend directory is in the python path
sys.path.append(os.getcwd())

from sqlalchemy import text
from app.db.session import engine

def fix_schema():
    print("🔧 Attempting to fix database schema...")
    with engine.connect() as conn:
        try:
            # Check if column exists strictly if needed, but IF NOT EXISTS is standard in PG 9.6+
            conn.execute(text("ALTER TABLE product ADD COLUMN IF NOT EXISTS name VARCHAR"))
            print("✅ Checked/Added 'name' column to 'product' table.")
            
            conn.execute(text("ALTER TABLE salesdata ADD COLUMN IF NOT EXISTS onpromotion BOOLEAN DEFAULT FALSE"))
            print("✅ Checked/Added 'onpromotion' column to 'salesdata' table.")
            
            conn.commit()
        except Exception as e:
            print(f"❌ Error altering table: {e}")
            # Fallback for databases that don't support IF NOT EXISTS in ALTER COLUMN
            if "duplicate column" in str(e):
                 print("ℹ️ Column 'name' already exists.")

if __name__ == "__main__":
    fix_schema()
