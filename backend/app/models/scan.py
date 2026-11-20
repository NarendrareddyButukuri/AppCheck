from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, BigInteger, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
import enum
from backend.app.core.database import Base
from backend.app.models.user import generate_uuid, utc_now

class ScanStatus(str, enum.Enum):
    QUEUED = "QUEUED"
    VALIDATING = "VALIDATING"
    EXTRACTING_MANIFEST = "EXTRACTING_MANIFEST"
    ANALYZING_PERMISSIONS = "ANALYZING_PERMISSIONS"
    EVALUATING_RULES = "EVALUATING_RULES"
    EVALUATING_ML = "EVALUATING_ML"
    CALCULATING_RISK = "CALCULATING_RISK"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"

class Scan(Base):
    __tablename__ = "scans"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    application_id = Column(String(36), ForeignKey("applications.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String(32), default=ScanStatus.QUEUED.value, nullable=False, index=True)
    progress_percent = Column(Integer, default=0, nullable=False)
    current_stage = Column(String(64), default="Initialized", nullable=False)
    error_message = Column(Text, nullable=True)
    started_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    # Relationships
    user = relationship("User", back_populates="scans")
    application = relationship("Application", back_populates="scans")
    events = relationship("ScanEvent", back_populates="scan", cascade="all, delete-orphan", order_by="ScanEvent.timestamp")
    permissions = relationship("Permission", back_populates="scan", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="scan", cascade="all, delete-orphan")
    risk_assessment = relationship("RiskAssessment", back_populates="scan", uselist=False, cascade="all, delete-orphan")
    reports = relationship("GeneratedReport", back_populates="scan", cascade="all, delete-orphan")


class ScanEvent(Base):
    __tablename__ = "scan_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    stage = Column(String(64), nullable=False)
    message = Column(Text, nullable=False)
    level = Column(String(16), default="INFO", nullable=False)
    timestamp = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    scan = relationship("Scan", back_populates="events")


class GeneratedReport(Base):
    __tablename__ = "generated_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(String(512), nullable=False)
    file_size_bytes = Column(BigInteger, default=0, nullable=False)
    report_type = Column(String(16), default="PDF", nullable=False)
    generated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    scan = relationship("Scan", back_populates="reports")
    user = relationship("User", back_populates="reports")
