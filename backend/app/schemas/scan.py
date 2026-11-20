from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict

class ApplicationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    package_name: str
    app_name: Optional[str] = None
    version_name: Optional[str] = None
    version_code: Optional[str] = None
    min_sdk: Optional[str] = None
    target_sdk: Optional[str] = None
    compile_sdk: Optional[str] = None
    sha256_hash: str
    file_size_bytes: int
    file_name: str
    created_at: str

class PermissionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    permission_name: str
    category: str
    protection_level: str
    description: Optional[str] = None
    is_dangerous: bool
    is_recognized: bool
    security_relevance: Optional[str] = None
    evidence: Optional[str] = None

class FindingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    rule_id: str
    title: str
    severity: str
    category: str
    description: str
    evidence: Optional[str] = None
    detection_method: str
    reason_for_concern: Optional[str] = None
    recommended_action: Optional[str] = None
    limitations: Optional[str] = None

class RiskAssessmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    score: int
    risk_level: str
    summary: str
    methodology: str
    calculation_breakdown: Optional[str] = None
    ml_prediction: Optional[str] = None
    ml_confidence: Optional[float] = None
    ml_status_message: Optional[str] = None
    created_at: str

class ScanEventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    stage: str
    message: str
    level: str
    timestamp: str

class ScanSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str
    progress_percent: int
    current_stage: str
    error_message: Optional[str] = None
    started_at: str
    completed_at: Optional[str] = None
    application: ApplicationResponse
    risk_assessment: Optional[RiskAssessmentResponse] = None

class ScanDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    status: str
    progress_percent: int
    current_stage: str
    error_message: Optional[str] = None
    started_at: str
    completed_at: Optional[str] = None
    application: ApplicationResponse
    events: List[ScanEventResponse] = []
    permissions: List[PermissionResponse] = []
    findings: List[FindingResponse] = []
    risk_assessment: Optional[RiskAssessmentResponse] = None

class TechnicalDetailsResponse(BaseModel):
    scan_id: str
    package_name: str
    sha256_hash: str
    manifest_xml_preview: Optional[str] = None
    activities_count: int
    services_count: int
    receivers_count: int
    providers_count: int
    exported_components_count: int
    activities: List[str] = []
    services: List[str] = []
    receivers: List[str] = []
    providers: List[str] = []
    exported_components: List[Dict[str, Any]] = []
    intent_filters: List[Dict[str, Any]] = []
    debuggable: bool = False
    allow_backup: bool = True
    cleartext_traffic: Optional[bool] = None
    analysis_limitations: List[str] = []
