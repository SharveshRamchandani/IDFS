from app.db.session import SessionLocal
from app.models.user import User

def fix_user_roles():
    db = SessionLocal()
    try:
        users = db.query(User).all()
        print("Current Users and Roles:")
        for user in users:
            print(f" - {user.email}: {user.role}")
            
            # Fix mapping
            dirty = False
            if user.role == "analyst":
                user.role = "inventory_analyst"
                dirty = True
            elif user.role == "manager":
                user.role = "store_manager"
                dirty = True
            elif user.role == "warehouse":
                user.role = "staff"
                dirty = True
                
            if dirty:
                print(f"   -> Updating to {user.role}")
                
        db.commit()
        print("[*] Roles updated successfully.")
        
    except Exception as e:
        print(f"[!] Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_user_roles()
