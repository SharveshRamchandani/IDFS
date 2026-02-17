import sys
import os

# Add the current directory to sys.path so we can import app modules
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from app.core.security import get_password_hash, verify_password

def verify_fix():
    print("Testing password hashing fix...")
    
    # Test a very long password (> 72 bytes)
    long_password = "a" * 100
    print(f"Password length: {len(long_password)}")
    
    try:
        hashed = get_password_hash(long_password)
        print(f"Successfully hashed long password. Hash length: {len(hashed)}")
        print(f"Hash: {hashed}")
        
        # Verify correctness
        is_valid = verify_password(long_password, hashed)
        print(f"Verification result (should be True): {is_valid}")
        
        is_invalid = verify_password("wrong_password", hashed)
        print(f"Invalid verification result (should be False): {is_invalid}")
        
        if is_valid and not is_invalid:
            print("\nSUCCESS: The 72-byte limit issue is resolved.")
        else:
            print("\nFAILURE: Verification logic is incorrect.")
            
    except Exception as e:
        print(f"\nFAILURE: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    verify_fix()
