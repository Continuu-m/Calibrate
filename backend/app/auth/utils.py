"""
auth/utils.py — The Security Engine

WHAT THIS FILE DOES:
This file handles two core security concerns:
  1. Password hashing — so we never store plain text passwords in the DB
  2. JWT token creation/verification — so users can stay logged in securely

SYSTEM DESIGN CONCEPT — Defense in Depth:
We use two separate layers of security:
  - bcrypt hashes passwords (one-way, can't be reversed)
  - JWT signs tokens (tamper-proof, time-limited)

Even if an attacker gets your database, they can't recover passwords.
Even if they intercept a token, it expires after 30 minutes.
"""

from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
import os
from dotenv import load_dotenv

load_dotenv()

# ─── Password Hashing ─────────────────────────────────────────────────────────

# CryptContext is a passlib object that manages hashing algorithms.
# "bcrypt" is the industry standard — it's intentionally slow to make
# brute-force attacks expensive. deprecated="auto" means old hashes
# get upgraded automatically if we ever switch algorithms.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(plain_password: str) -> str:
    """
    Converts a plain text password into a bcrypt hash.
    Example: "mypassword123" → "$2b$12$eW5..."
    We store the hash in the DB, never the original.
    """
    return pwd_context.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Checks if a plain password matches a stored hash.
    bcrypt re-hashes the plain password and compares — never decrypts.
    Returns True if match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


# ─── JWT Token ────────────────────────────────────────────────────────────────

# These come from your .env file — never hardcode secrets in code.
SECRET_KEY = os.getenv("SECRET_KEY", "change-this-in-production")
ALGORITHM = "HS256"          # HMAC-SHA256 — fast, secure, standard
ACCESS_TOKEN_EXPIRE_MINUTES = 30


def create_access_token(data: dict) -> str:
    """
    Creates a signed JWT token.

    HOW JWT WORKS:
    A JWT has 3 parts separated by dots: header.payload.signature
      - Header: algorithm info
      - Payload: your data (user_id, email, expiry) — BASE64 encoded, NOT encrypted
      - Signature: HMAC(header + payload, SECRET_KEY) — proves nobody tampered with it

    SYSTEM DESIGN NOTE:
    JWTs are "stateless" — the server doesn't store them anywhere.
    It just verifies the signature on every request. This means:
      ✅ No database lookup needed per request (fast)
      ✅ Scales horizontally (any server can verify)
      ❌ Can't invalidate a token before it expires (logout is client-side only)
    For MVP this is fine. Later you'd add a Redis blocklist for true logout.
    """
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})  # JWT standard claim for expiry

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict | None:
    """
    Verifies a JWT token's signature and expiry.
    Returns the payload dict if valid, None if invalid or expired.

    The jose library automatically checks:
      - Signature matches (wasn't tampered with)
      - Token hasn't expired (exp claim)
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None