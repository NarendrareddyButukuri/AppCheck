from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, BigInteger, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.user import generate_uuid, utc_now

class Application(Base):
    __tablename__ = "applications"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    package_name = Column(String(255), index=True, nullable=False)
    app_name = Column(String(255), nullable=True)
    version_name = Column(String(64), nullable=True)
    version_code = Column(String(64), nullable=True)
    min_sdk = Column(String(16), nullable=True)
    target_sdk = Column(String(16), nullable=True)
    compile_sdk = Column(String(16), nullable=True)
    sha256_hash = Column(String(64), index=True, nullable=False)
    file_size_bytes = Column(BigInteger, nullable=False)
    file_name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="applications")
    scans = relationship("Scan", back_populates="application", cascade="all, delete-orphan")
