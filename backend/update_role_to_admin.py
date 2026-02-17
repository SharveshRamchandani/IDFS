"""
Quick script to check your current role and update it to admin if needed
"""
from app.db.session import SessionLocal
from app.models.user import User, UserRole

db = SessionLocal()

# Get all users
users = db.query(User).all()

print("\n=== Current Users ===")
for user in users:
    print(f"ID: {user.id}, Email: {user.email}, Role: {user.role}, Superuser: {user.is_superuser}")

print("\n=== Making first user an admin ===")
if users:
    first_user = users[0]
    first_user.role = UserRole.ADMIN
    db.commit()
    print(f"✅ Updated {first_user.email} to ADMIN role")
else:
    print("❌ No users found!")

db.close()
