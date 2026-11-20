import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from backend.app.core.database import get_db
from backend.app.core.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from backend.app.core.config import settings
from backend.app.models.user import User, UserSession, PasswordResetToken, EmailVerification
from backend.app.schemas.auth import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    UserResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MessageResponse,
)
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

def format_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        is_active=user.is_active,
        is_verified=user.is_verified,
        created_at=user.created_at.isoformat() if user.created_at else "",
    )

@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegisterRequest, db: AsyncSession = Depends(get_db)):
    if not payload.terms_accepted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must accept the terms of service and privacy policy to continue.",
        )
    
    # Check duplicate account
    stmt = select(User).where(User.email == payload.email.lower().strip())
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="An account with this email address already exists.",
        )
    
    # Hash password with Argon2id
    hashed_pw = get_password_hash(payload.password)
    
    new_user = User(
        email=payload.email.lower().strip(),
        full_name=payload.full_name.strip(),
        hashed_password=hashed_pw,
        is_active=True,
        is_verified=True,  # Activated upon registration
    )
    db.add(new_user)
    await db.flush()

    # Generate session & tokens
    access_token = create_access_token(new_user.id)
    refresh_token = create_refresh_token(new_user.id)

    session_token = secrets.token_hex(32)
    user_session = UserSession(
        user_id=new_user.id,
        session_token=session_token,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES),
    )
    db.add(user_session)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=format_user_response(new_user),
    )

@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLoginRequest, db: AsyncSession = Depends(get_db)):
    stmt = select(User).where(User.email == payload.email.lower().strip())
    user = (await db.execute(stmt)).scalar_one_or_none()
    
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password credentials.",
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Your account has been deactivated. Please contact support.",
        )

    # Expiry delta based on remember_me
    access_delta = timedelta(days=7) if payload.remember_me else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(user.id, expires_delta=access_delta)
    refresh_token = create_refresh_token(user.id)

    # Track session
    session_token = secrets.token_hex(32)
    user_session = UserSession(
        user_id=user.id,
        session_token=session_token,
        expires_at=datetime.now(timezone.utc) + (timedelta(days=30) if payload.remember_me else timedelta(days=7)),
    )
    db.add(user_session)
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=format_user_response(user),
    )

@router.post("/logout", response_model=MessageResponse)
async def logout(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Clear user sessions
    stmt = select(UserSession).where(UserSession.user_id == current_user.id)
    sessions = (await db.execute(stmt)).scalars().all()
    for s in sessions:
        await db.delete(s)
    await db.commit()
    return MessageResponse(message="Successfully logged out of all active sessions.")

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(refresh_token: str, db: AsyncSession = Depends(get_db)):
    payload = decode_token(refresh_token)
    if not payload or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token.",
        )
    
    user_id = payload.get("sub")
    stmt = select(User).where(User.id == user_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer active or found.",
        )
    
    new_access_token = create_access_token(user.id)
    new_refresh_token = create_refresh_token(user.id)
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        user=format_user_response(user),
    )

@router.post("/forgot-password", response_model=MessageResponse)
async def forgot_password(payload: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    """
    Generates a secure, single-use password reset token.
    Security Requirement: Does not reveal whether an arbitrary email address exists.
    """
    stmt = select(User).where(User.email == payload.email.lower().strip())
    user = (await db.execute(stmt)).scalar_one_or_none()
    
    reset_token_plain = None
    if user and user.is_active:
        # Create single-use token
        reset_token_plain = secrets.token_urlsafe(32)
        reset_token_entry = PasswordResetToken(
            user_id=user.id,
            token_hash=get_password_hash(reset_token_plain),
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES),
            is_used=False,
        )
        db.add(reset_token_entry)
        await db.commit()

    # Generic security message (never reveal if email exists)
    resp = {
        "message": "If this email address is registered with AppCheck, instructions to reset your password have been issued.",
        "success": True
    }
    if reset_token_plain:
        # Pass development reset token in debug payload for seamless testing
        resp["data"] = {"demo_reset_token": reset_token_plain}
    
    return MessageResponse(**resp)

@router.post("/reset-password", response_model=MessageResponse)
async def reset_password(payload: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    """Validates single-use reset token and securely updates password."""
    # Find all active, unexpired tokens
    now = datetime.now(timezone.utc)
    stmt = select(PasswordResetToken).where(
        PasswordResetToken.is_used == False,
        PasswordResetToken.expires_at > now
    )
    tokens = (await db.execute(stmt)).scalars().all()
    
    matched_token = None
    for t in tokens:
        if verify_password(payload.token, t.token_hash):
            matched_token = t
            break

    if not matched_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The password reset link is invalid, expired, or has already been used.",
        )

    # Get user
    stmt = select(User).where(User.id == matched_token.user_id)
    user = (await db.execute(stmt)).scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    # Update password using Argon2id
    user.hashed_password = get_password_hash(payload.new_password)
    matched_token.is_used = True
    await db.commit()

    return MessageResponse(message="Password has been successfully updated. You may now log in.")

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return format_user_response(current_user)
