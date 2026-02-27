"""
Shift all SalesData dates forward so the most-recent record lands on today.

Run from backend/ folder:
    .venv\Scripts\python.exe shift_sales_dates.py
"""

import sys, os
from datetime import date

sys.path.insert(0, os.path.dirname(__file__))

from app.db.session import engine
from sqlalchemy import text

def run():
    with engine.connect() as conn:
        max_date = conn.execute(text('SELECT MAX(date) FROM salesdata')).scalar()

        if max_date is None:
            print("No sales records found. Nothing to do.")
            return

        today = date.today()
        delta_days = (today - max_date).days

        if delta_days == 0:
            print(f"Already up-to-date (max date = {max_date}).")
            return

        print(f"Current max date : {max_date}")
        print(f"Today            : {today}")
        print(f"Shifting by      : {delta_days} days...")

        total = conn.execute(text('SELECT COUNT(*) FROM salesdata')).scalar()
        conn.execute(text(f"UPDATE salesdata SET date = date + INTERVAL '{delta_days} days'"))
        conn.commit()

        new_max = conn.execute(text('SELECT MAX(date) FROM salesdata')).scalar()
        new_min = conn.execute(text('SELECT MIN(date) FROM salesdata')).scalar()
        print(f"Done! Updated {total:,} records.")
        print(f"New date range: {new_min}  to  {new_max}")

if __name__ == "__main__":
    run()
