from app.db.base_class import Base
from app.db.session import engine
# Make sure to import all models here so they are registered with Base.metadata
from app.models.user import User
from app.models.sales import Product, Store, SalesData, Holiday
from app.models.forecast import Forecast
from app.models.supply_chain import Supplier, PurchaseOrder, Shipment

def init_db():
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    print("Creating database tables...")
    init_db()
    print("Tables created!")
