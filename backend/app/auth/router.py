"""
auth/router.py — Authentication Routes

WHAT THIS FILE DOES:
Two endpoints that handle the full auth lifecycle:
  POST /auth/register → create account
  POST /auth/login    → get JWT token

SYSTEM DESIGN CONCEPT — API Router:
Instead of defining all routes in main.py, we use APIRouter to group
related routes into modules. main.py just "includes" this router.
This keeps code organized as the app grows.

SECURITY DESIGN DECISIONS:
  1. We hash passwords BEFORE saving to DB (never store plain text)
  2. We return the same error for "wrong email" and "wrong password"
     → Prevents user enumeration attacks (attacker can't tell if email exists)
  3. Tokens contain user_id (sub claim) not email
     → Less sensitive data in token, works even if email changes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.auth.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse, PreferencesUpdate
from app.auth.utils import hash_password, verify_password, create_access_token
from app.auth.dependencies import get_current_user
from app.limiter import limiter
from fastapi import Request

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Create a new user account.

    FLOW:
      1. Check email isn't already taken
      2. Hash the password (bcrypt)
      3. Save user to DB
      4. Return safe user object (no password hash)

    WHY WE DON'T RETURN A TOKEN HERE:
    Forcing users to log in after register is a deliberate choice —
    it verifies the login flow works and gives a cleaner UX separation.
    You could return a token here too if you prefer auto-login on register.
    """
    # Step 1: Check for duplicate email
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Step 2: Hash password — never store plain text
    hashed = hash_password(payload.password)

    # Step 3: Create and save user
    user = User(
        email=payload.email,
        hashed_password=hashed,
        full_name=payload.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)  # Reloads user from DB so we get the auto-generated id

    return user


@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, payload: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate and return a JWT token.

    FLOW:
      1. Look up user by email
      2. Verify password against hash
      3. Create JWT with user_id as subject
      4. Return token

    SECURITY NOTE — Generic error message:
    We return "Invalid credentials" for BOTH wrong email and wrong password.
    This prevents user enumeration (attacker can't tell if email exists).
    """
    # Step 1: Find user — use same error as wrong password (enumeration prevention)
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Step 2: Create JWT — "sub" (subject) is the standard JWT claim for user identity
    token = create_access_token(data={"sub": str(user.id)})

    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently logged-in user's profile.
    This route is protected — requires a valid JWT.

    This is also a good route to test that your token works:
    GET /auth/me with Authorization: Bearer <your_token>
    """
    return current_user


@router.patch("/preferences", response_model=UserResponse)
def update_preferences(
    payload: PreferencesUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Updates the user's preferences dictionary.
    """
    # Merge existing preferences with new ones
    current_prefs = current_user.preferences or {}
    updated_prefs = {**current_prefs, **payload.preferences}
    
    current_user.preferences = updated_prefs
    db.commit()
    db.refresh(current_user)
    
    return current_user