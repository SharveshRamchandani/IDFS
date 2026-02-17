import sys
import os

# Add the current directory to sys.path so we can import app modules
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

from app.core import security
from passlib.context import CryptContext
import hashlib

def test_bcrypt_limit():
    print("Testing bcrypt limit workaround...")
    long_password = "a" * 100
    try:
        hashed = security.get_password_hash(long_password)
        print(f"Success! Hashed length: {len(hashed)}")
    except Exception as e:
        print(f"Failed to hash long password: {e}")

    print("\nTesting raw bcrypt (should fail)...")
    pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
    try:
        pwd_context.hash(long_password)
        print("Unexpected: Raw bcrypt succeeded (maybe passlib handles it?)")
    except Exception as e:
        print(f"Expected failure: {e}")

try:
    from google.oauth2 import id_token
    from google.auth.transport import requests
    print("\nGoogle auth library imported successfully.")
except ImportError:
    print("\nGoogle auth library not found.")

if __name__ == "__main__":
    test_bcrypt_limit()
