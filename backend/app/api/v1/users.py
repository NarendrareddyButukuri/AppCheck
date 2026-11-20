from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.app.core.database import get_db
from backend.app.core.security import verify_password, get_password_hash
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.schemas.auth import UserResponse, ChangePasswordRequest, MessageResponse
from backend.app.api.v1.auth import format_user_response

router = APIRouter(prefix="/users", tags=["User Profile & Settings"])

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    full_name: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if len(full_name.strip()) < 2:
        raise HTTPException(status_code=400, detail="Name must be at least 2 characters long.")
    
    current_user.full_name = full_name.strip()
    await db.commit()
    await db.refresh(current_user)
    return format_user_response(current_user)

@router.post("/change-password", response_model=MessageResponse)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="The current password provided is incorrect.",
        )
    
    current_user.hashed_password = get_password_hash(payload.new_password)
    await db.commit()
    return MessageResponse(message="Your password has been securely updated.")

@router.delete("/account", response_model=MessageResponse)
async def delete_account(
    confirmation: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Destructive operation: Permanently deletes user account, scans, reports, and sessions.
    """
    if confirmation.upper() != "DELETE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please provide confirmation keyword 'DELETE' to proceed.",
        )
    
    await db.delete(current_user)
    await db.commit()
    return MessageResponse(message="Your account and all associated security records have been permanently deleted.")
