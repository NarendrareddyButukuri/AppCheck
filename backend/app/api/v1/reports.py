from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload

from backend.app.core.config import settings
from backend.app.core.database import get_db
from backend.app.api.deps import get_current_user
from backend.app.models.user import User
from backend.app.models.scan import Scan, GeneratedReport
from backend.app.services.report_service import generate_pdf_report
from backend.app.schemas.report import ReportResponse

router = APIRouter(tags=["PDF Reports"])

@router.get("/scans/{scan_id}/report")
async def download_scan_report(
    scan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Downloads the verified ReportLab PDF security report for the authenticated user.
    Enforces user ownership.
    """
    stmt = (
        select(Scan)
        .where(Scan.id == scan_id, Scan.user_id == current_user.id)
        .options(
            selectinload(Scan.application),
            selectinload(Scan.findings),
            selectinload(Scan.permissions),
            selectinload(Scan.risk_assessment),
        )
    )
    scan = (await db.execute(stmt)).scalar_one_or_none()
    if not scan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scan record not found or access denied.",
        )

    pdf_path = settings.REPORTS_DIR / f"appcheck_report_{scan.id}.pdf"
    
    # Generate on the fly if not exists
    if not pdf_path.exists():
        app = scan.application
        ra = scan.risk_assessment
        findings_data = [
            {
                "rule_id": f.rule_id,
                "title": f.title,
                "severity": f.severity,
                "category": f.category,
                "description": f.description,
                "evidence": f.evidence,
                "recommended_action": f.recommended_action
            } for f in scan.findings
        ]
        perms_data = [
            {
                "permission_name": p.permission_name,
                "category": p.category,
                "protection_level": p.protection_level,
                "is_dangerous": p.is_dangerous,
                "security_relevance": p.security_relevance
            } for p in scan.permissions
        ]

        generate_pdf_report({
            "application": {
                "app_name": app.app_name,
                "package_name": app.package_name,
                "version_name": app.version_name,
                "version_code": app.version_code,
                "target_sdk": app.target_sdk,
                "min_sdk": app.min_sdk,
                "file_size_bytes": app.file_size_bytes,
                "sha256_hash": app.sha256_hash,
            },
            "risk_assessment": {
                "score": ra.score if ra else 0,
                "risk_level": ra.risk_level if ra else "SAFE",
                "summary": ra.summary if ra else "Completed",
                "ml_prediction": ra.ml_prediction if ra else None,
            },
            "findings": findings_data,
            "permissions": perms_data
        }, pdf_path)

    clean_filename = f"AppCheck_Report_{scan.application.package_name}_{scan.id[:8]}.pdf"
    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=clean_filename,
    )

@router.get("/reports", response_model=list)
async def list_user_reports(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(GeneratedReport)
        .where(GeneratedReport.user_id == current_user.id)
        .order_by(desc(GeneratedReport.generated_at))
    )
    reports = (await db.execute(stmt)).scalars().all()
    return [
        {
            "id": r.id,
            "scan_id": r.scan_id,
            "file_size_bytes": r.file_size_bytes,
            "report_type": r.report_type,
            "generated_at": r.generated_at.isoformat() if r.generated_at else "",
        } for r in reports
    ]
