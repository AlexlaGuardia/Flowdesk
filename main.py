from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from datetime import datetime, timezone

import config
import db


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database on startup."""
    db.init_db()
    config.UPLOAD_DIR.mkdir(exist_ok=True)
    yield


app = FastAPI(
    title="Stampwerk API",
    version="0.1.0",
    description="AI-native freelancer business tool",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health ──

@app.get("/health")
async def health():
    user_count = db.query("SELECT COUNT(*) as c FROM users")[0]["c"]
    return {
        "status": "ok",
        "service": "stampwerk",
        "version": "0.1.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "users": user_count,
    }


# ── Auth Routes ──

from auth import (
    create_magic_token, verify_magic_token, create_jwt,
    get_or_create_user, get_current_user
)
from models import MagicLinkRequest, TokenResponse, UserOut, UserUpdate, MessageResponse
import email_service


@app.post("/auth/magic-link", response_model=MessageResponse)
async def request_magic_link(body: MagicLinkRequest):
    """Send a magic login link to the email address."""
    token = create_magic_token(body.email)
    email_service.send_magic_link(body.email, token)
    return {"message": "Magic link sent. Check your email."}


@app.get("/auth/verify")
async def verify_magic_link(token: str):
    """Verify a magic link token and return JWT."""
    email = verify_magic_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Invalid or expired magic link")
    user = get_or_create_user(email)
    jwt_token = create_jwt(user["id"], user["email"])
    response = JSONResponse(content={
        "access_token": jwt_token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "onboarded": bool(user["onboarded"]),
        }
    })
    response.set_cookie(
        key="session",
        value=jwt_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=config.JWT_EXPIRY_HOURS * 3600,
    )
    return response


from fastapi import Depends, HTTPException

@app.get("/auth/me", response_model=UserOut)
async def get_me(user: dict = Depends(get_current_user)):
    """Get the current authenticated user."""
    return UserOut(**{**user, "onboarded": bool(user["onboarded"])})


@app.patch("/auth/me", response_model=UserOut)
async def update_me(body: UserUpdate, user: dict = Depends(get_current_user)):
    """Update the current user's profile."""
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        return UserOut(**{**user, "onboarded": bool(user["onboarded"])})

    set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [user["id"]]
    db.execute(f"UPDATE users SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", tuple(values))

    updated = db.query("SELECT * FROM users WHERE id = ?", (user["id"],), one=True)
    return UserOut(**updated, onboarded=bool(updated["onboarded"]))


@app.post("/auth/onboard", response_model=UserOut)
async def complete_onboarding(body: UserUpdate, user: dict = Depends(get_current_user)):
    """Complete onboarding (set name, business name, brand color)."""
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    updates["onboarded"] = 1
    set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
    values = list(updates.values()) + [user["id"]]
    db.execute(f"UPDATE users SET {set_clause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?", tuple(values))

    updated = db.query("SELECT * FROM users WHERE id = ?", (user["id"],), one=True)
    return UserOut(**{**updated, "onboarded": bool(updated["onboarded"])})


# ── Register route modules ──

from client_routes import router as client_router
from project_routes import router as project_router
from proposal_routes import router as proposal_router
from invoice_routes import router as invoice_router
from contract_routes import router as contract_router
from portal_routes import router as portal_router

app.include_router(client_router)
app.include_router(project_router)
app.include_router(proposal_router)
app.include_router(invoice_router)
app.include_router(contract_router)
app.include_router(portal_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=config.PORT, reload=True)
