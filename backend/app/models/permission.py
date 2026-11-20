from sqlalchemy import Column, String, Boolean, ForeignKey, Text
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.user import generate_uuid

class Permission(Base):
    __tablename__ = "permissions"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    permission_name = Column(String(255), nullable=False, index=True)
    category = Column(String(64), default="Other", nullable=False)
    protection_level = Column(String(32), default="Unknown", nullable=False)
    description = Column(Text, nullable=True)
    is_dangerous = Column(Boolean, default=False, nullable=False)
    is_recognized = Column(Boolean, default=True, nullable=False)
    security_relevance = Column(Text, nullable=True)
    evidence = Column(Text, nullable=True)

    scan = relationship("Scan", back_populates="permissions")
