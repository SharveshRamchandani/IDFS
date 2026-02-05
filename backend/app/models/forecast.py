from sqlalchemy import Column, Integer, Float, Date, DateTime, String, func
from app.db.base_class import Base

class Forecast(Base):
    id = Column(Integer, primary_key=True, index=True)
    forecast_date = Column(Date, index=True, nullable=False)
    predicted_value = Column(Float, nullable=False)
    lower_bound = Column(Float)
    upper_bound = Column(Float)
    model_version = Column(String, default="1.0")
    created_at = Column(DateTime, server_default=func.now())
