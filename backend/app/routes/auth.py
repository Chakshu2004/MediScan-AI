"""
app/routes/auth.py — Google OAuth 2.0 + JWT token endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token, decode_token
from app.core.config import settings
from app.models.user import User
from app.models.schemas import GoogleAuthRequest, TokenResponse, RefreshRequest
from app.services.google_auth import (
    get_google_auth_url,
    exchange_code_for_tokens,
    get_google_user_info,
)

router = APIRouter()


@router.get("/google/url")
async def google_auth_url(state: str = ""):
    """Return the Google OAuth consent-screen URL."""
    return {"url": get_google_auth_url(state)}


@router.post("/google/callback", response_model=TokenResponse)
async def google_callback(
    body: GoogleAuthRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Exchange Google auth code → Google tokens → user info →
    upsert User in DB → return our JWT pair.
    """
    google_tokens = await exchange_code_for_tokens(body.code)
    user_info = await get_google_user_info(google_tokens["access_token"])

    google_id = user_info.get("sub")
    email     = user_info.get("email")
    name      = user_info.get("name", email)
    picture   = user_info.get("picture")

    # Upsert user
    result = await db.execute(select(User).where(User.google_id == google_id))
    user: User | None = result.scalar_one_or_none()

    if not user:
        # Check by email as fallback
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

    if user:
        user.google_id = google_id
        user.picture   = picture
        user.name      = name
    else:
        user = User(email=email, name=name, picture=picture, google_id=google_id)
        db.add(user)

    await db.flush()
    await db.refresh(user)

    access_token  = create_access_token(str(user.id))
    refresh_token = create_refresh_token(str(user.id))

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    """Rotate tokens using a valid refresh token."""
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not a refresh token")

    user_id = payload["sub"]
    result  = await db.execute(select(User).where(User.id == user_id))
    user    = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return TokenResponse(
        access_token=create_access_token(str(user.id)),
        refresh_token=create_refresh_token(str(user.id)),
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
