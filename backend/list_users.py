from app.db.session import SessionLocal
from app.models.user import User

def list_users():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print(f"Found {len(users)} users:")
        print(f"{'ID':<5} | {'Email':<30} | {'Role':<10} | {'Name'}")
        print("-" * 60)
        for u in users:
            print(f"{u.id:<5} | {u.email:<30} | {u.role:<10} | {u.full_name}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    list_users()
