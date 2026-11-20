from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Boolean, ForeignKey, Text, DateTime
from sqlalchemy.orm import relationship
from backend.app.core.database import Base
from backend.app.models.user import generate_uuid, utc_now

class MLModel(Base):
    __tablename__ = "ml_models"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    model_name = Column(String(128), nullable=False)
    model_type = Column(String(64), nullable=False)  # Random Forest, Decision Tree, Logistic Regression
    version = Column(String(32), nullable=False)
    file_path = Column(String(512), nullable=False)
    dataset_origin = Column(String(128), nullable=False)  # Drebin / CICAndMal2017
    is_active = Column(Boolean, default=False, nullable=False)
    trained_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    metrics_json = Column(Text, nullable=True)

    evaluations = relationship("ModelEvaluation", back_populates="ml_model", cascade="all, delete-orphan")


class ModelEvaluation(Base):
    __tablename__ = "model_evaluations"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    ml_model_id = Column(String(36), ForeignKey("ml_models.id", ondelete="CASCADE"), nullable=False, index=True)
    dataset_name = Column(String(128), nullable=False)
    accuracy = Column(Float, nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    confusion_matrix_json = Column(Text, nullable=True)
    evaluated_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)

    ml_model = relationship("MLModel", back_populates="evaluations")
