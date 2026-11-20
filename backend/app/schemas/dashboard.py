from typing import List, Optional, Dict
from pydantic import BaseModel
from backend.app.schemas.scan import ScanSummaryResponse, FindingResponse

class DashboardStatsResponse(BaseModel):
    total_scans: int
    safe_count: int
    medium_risk_count: int
    high_risk_count: int
    recent_scans: List[ScanSummaryResponse] = []
    risk_distribution: Dict[str, int] = {}
    recent_findings: List[FindingResponse] = []
    system_availability: str = "100%"
    ml_model_availability: bool = False
    ml_model_name: Optional[str] = None
    ml_model_version: Optional[str] = None
