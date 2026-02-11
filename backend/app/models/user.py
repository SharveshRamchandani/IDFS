from sqlalchemy import Boolean, Column, Integer, String
from app.db.base_class import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    ANALYST = "analyst"
    MANAGER = "manager"
    WAREHOUSE = "warehouse"

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False)
    role = Column(String, default=UserRole.ANALYST)
