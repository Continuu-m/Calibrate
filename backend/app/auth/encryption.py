import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

# Get secret key from environment
SECRET_KEY = os.environ.get("SECRET_KEY", "fallback-secret-key-for-dev-only")

# Derive a 32-byte key for Fernet from the SECRET_KEY
salt = b'calibrate-salt' # In production, this should be a stable, secret salt
kdf = PBKDF2HMAC(
    algorithm=hashes.SHA256(),
    length=32,
    salt=salt,
    iterations=100000,
)
key = base64.urlsafe_b64encode(kdf.derive(SECRET_KEY.encode()))
fernet = Fernet(key)

def encrypt_string(text: str) -> str:
    """Encrypt a string and return a base64 string."""
    if not text:
        return text
    return fernet.encrypt(text.encode()).decode()

def decrypt_string(encrypted_text: str) -> str:
    """Decrypt a base64 string and return the original string."""
    if not encrypted_text:
        return encrypted_text
    try:
        return fernet.decrypt(encrypted_text.encode()).decode()
    except Exception:
        # If decryption fails (e.g. invalid key or non-encrypted data), return as is
        # This helps during migration from plain text to encrypted
        return encrypted_text
