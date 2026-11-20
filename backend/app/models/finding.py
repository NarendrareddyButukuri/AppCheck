from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.user import generate_uuid, utc_now

class Finding(Base):
    __tablename__ = "findings"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, index=True)
    rule_id = Column(String(64), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    severity = Column(String(32), default="LOW", nullable=False, index=True)  # INFORMATIONAL, LOW, MEDIUM, HIGH, CRITICAL
    category = Column(String(64), nullable=False)
    description = Column(Text, nullable=False)
    evidence = Column(Text, nullable=True)
    detection_method = Column(String(128), default="Static Manifest & Bytecode Inspection", nullable=False)
    reason_for_concern = Column(Text, nullable=True)
    recommended_action = Column(Text, nullable=True)
    limitations = Column(Text, nullable=True)

    scan = relationship("Scan", back_populates="findings")


class RiskAssessment(Base):
    __tablename__ = "risk_assessments"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    scan_id = Column(String(36), ForeignKey("scans.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    score = Column(Integer, nullable=False)  # 0 to 100
    risk_level = Column(String(32), nullable=False)  # SAFE, LOW, MEDIUM, HIGH, CRITICAL
    summary = Column(Text, nullable=False)
    methodology = Column(Text, nullable=False)
    calculation_breakdown = Column(Text, nullable=True)  # JSON formatted breakdown
    ml_prediction = Column(String(64), nullable=True)  # e.g., "BENIGN", "MALWARE", or None
    ml_confidence = Column(Float, nullable=True)  # 0.0 - 1.0 or None
    ml_status_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    scan = relationship("Scan", back_populates="risk_assessment")
