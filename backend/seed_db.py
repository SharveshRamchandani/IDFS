from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.crud.crud_user import create
from app.schemas.user import UserCreate
from app.core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    try:
        user_in = UserCreate(
            email="admin@ikea.com",
            password="admin",
            full_name="Admin User",
            role="admin",
            is_superuser=True
        )
        # Check if exists
        from app.models.user import User
        user = db.query(User).filter(User.email == user_in.email).first()
        if not user:
            create(db, user_in)
            print("Admin user created: email=admin@ikea.com, password=admin")
        else:
            print("Admin user already exists")
            
    except Exception as e:
        print(f"Error seeding DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
