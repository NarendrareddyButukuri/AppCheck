from datetime import datetime, timedelta, timezone
from typing import Optional, Any, Union
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from backend.app.core.config import settings

# Argon2id password hasher (Type.ID is default in argon2-cffi)
ph = PasswordHasher(
    time_cost=3,
    memory_cost=65536,  # 64 MiB
    parallelism=2,
    hash_len=32,
    salt_len=16
)

def get_password_hash(password: str) -> str:
    """Hash a password using Argon2id"""
    return ph.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the Argon2id hash"""
    try:
        return ph.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"
    }
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except Exception:
        return None
