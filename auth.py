import secrets
from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from itsdangerous import URLSafeTimedSerializer
from fastapi import HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

import config
import db

security = HTTPBearer(auto_error=False)
magic_serializer = URLSafeTimedSerializer(config.MAGIC_LINK_SECRET)


def create_magic_token(email: str) -> str:
    """Create a magic link token for email verification."""
    return magic_serializer.dumps(email, salt="magic-link")


def verify_magic_token(token: str) -> str | None:
    """Verify a magic link token. Returns email or None."""
    try:
        email = magic_serializer.loads(
            token, salt="magic-link",
            max_age=config.MAGIC_LINK_EXPIRY_MINUTES * 60
        )
        return email
    except Exception:
        return None


def create_jwt(user_id: int, email: str) -> str:
    """Create a JWT access token."""
    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=config.JWT_EXPIRY_HOURS),
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)


def decode_jwt(token: str) -> dict | None:
    """Decode and verify a JWT. Returns payload or None."""
    try:
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None


def get_or_create_user(email: str) -> dict:
    """Get existing user or create a new one. Returns user dict."""
    user = db.query("SELECT * FROM users WHERE email = ?", (email,), one=True)
    if user:
        return user
    user_id = db.execute(
        "INSERT INTO users (email, name) VALUES (?, ?)",
        (email, email.split("@")[0])
    )
    return db.query("SELECT * FROM users WHERE id = ?", (user_id,), one=True)


async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """FastAPI dependency — extract and verify the current user from JWT.

    Checks Authorization header first, then falls back to session cookie.
    """
    token = None

    # Try bearer token
    if credentials:
        token = credentials.credentials

    # Fallback to cookie
    if not token:
        token = request.cookies.get("session")

    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")

    payload = decode_jwt(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = int(payload["sub"])
    user = db.query("SELECT * FROM users WHERE id = ?", (user_id,), one=True)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return user


def generate_share_token() -> str:
    """Generate a unique share token for public URLs."""
    return secrets.token_urlsafe(24)
