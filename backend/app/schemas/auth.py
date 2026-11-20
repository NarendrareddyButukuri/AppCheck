from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict

class UserRegisterRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    terms_accepted: bool = Field(..., description="Must accept terms and privacy policy")

class UserLoginRequest(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: "UserResponse"

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    email: str
    full_name: str
    is_active: bool
    is_verified: bool
    created_at: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)

class MessageResponse(BaseModel):
    message: str
    success: bool = True
    data: Optional[dict] = None
