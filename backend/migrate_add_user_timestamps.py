"""
One-shot migration: Add created_at and last_login columns to the 'user' table.
Run once from the backend/ directory:
    python migrate_add_user_timestamps.py
"""
import sys
import os

# Make sure app imports work
sys.path.insert(0, os.path.dirname(__file__))

from app.db.session import engine
from sqlalchemy import text

def run():
    with engine.connect() as conn:
        # Add created_at — default to NOW() for both new and existing rows
        conn.execute(text("""
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();
        """))
        print("✅  created_at column added (or already existed).")

        # Add last_login — nullable, no default
        conn.execute(text("""
            ALTER TABLE "user"
            ADD COLUMN IF NOT EXISTS last_login TIMESTAMPTZ;
        """))
        print("✅  last_login column added (or already existed).")

        conn.commit()
        print("✅  Migration committed successfully.")

if __name__ == "__main__":
    run()
