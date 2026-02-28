"""
auth/schemas.py — Request & Response Contracts

WHAT THIS FILE DOES:
Pydantic models define the shape of data coming IN (requests)
and going OUT (responses) of your API.

SYSTEM DESIGN CONCEPT — Separation of Concerns:
Schemas are NOT the same as database models (SQLAlchemy).
  - SQLAlchemy models = how data is stored in Postgres
  - Pydantic schemas = what the API accepts and returns

This separation means:
  ✅ You control exactly what fields users can send (security)
  ✅ You control exactly what fields are returned (never leak hashed_password)
  ✅ FastAPI auto-validates and auto-documents everything via Swagger
"""

from pydantic import BaseModel, EmailStr


# ─── Request Schemas (what users send to us) ──────────────────────────────────

class RegisterRequest(BaseModel):
    """
    What we expect when a user signs up.
    EmailStr automatically validates email format (e.g. rejects "notanemail").
    """
    email: EmailStr
    password: str
    full_name: str | None = None


class LoginRequest(BaseModel):
    """
    What we expect when a user logs in.
    """
    email: EmailStr
    password: str

class PreferencesUpdate(BaseModel):
    """
    What we expect when a user updates their preferences.
    """
    preferences: dict

class ProfileUpdate(BaseModel):
    """
    What we expect when a user updates their basic profile.
    """
    full_name: str | None = None


# ─── Response Schemas (what we send back) ─────────────────────────────────────

class TokenResponse(BaseModel):
    """
    What we return after a successful login.
    access_token: the JWT string the client stores and sends with future requests
    token_type: always "bearer" — this is the OAuth2 standard naming
    """
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """
    Safe user representation — notice hashed_password is NOT here.
    We never send the password hash back to clients.
    """
    id: int
    email: str
    full_name: str | None
    preferences: dict | None = None
    google_calendar_connected: bool = False

    class Config:
        from_attributes = True  # Allows converting SQLAlchemy model → this schema