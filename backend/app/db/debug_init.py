import sys
import os

# Add the parent directory to sys.path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app.db.base_class import Base
from app.models.sales import Holiday
from app.db.session import engine

print("Tables in metadata:", Base.metadata.tables.keys())

try:
    Base.metadata.create_all(bind=engine)
    print("create_all executed successfully")
except Exception as e:
    print(f"Error executing create_all: {e}")
