from typing import Optional
from pydantic import BaseModel, ConfigDict

class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scan_id: str
    file_path: str
    file_size_bytes: int
    report_type: str
    generated_at: str

class SystemHealthResponse(BaseModel):
    status: str
    version: str
    database: str
    ml_service: str
    androguard_available: bool
    active_workers: int

class ModelStatusResponse(BaseModel):
    available: bool
    model_name: Optional[str] = None
    model_type: Optional[str] = None
    version: Optional[str] = None
    accuracy: Optional[float] = None
    precision: Optional[float] = None
    recall: Optional[float] = None
    f1_score: Optional[float] = None
    dataset_origin: Optional[str] = None
    trained_at: Optional[str] = None
    feature_count: Optional[int] = None
