from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from backend.app.core.database import get_db
from backend.app.core.config import settings
from backend.app.services.ml_service import get_ml_status
from backend.app.schemas.report import SystemHealthResponse, ModelStatusResponse

router = APIRouter(prefix="/system", tags=["System Status"])

@router.get("/health", response_model=SystemHealthResponse)
async def get_system_health(db: AsyncSession = Depends(get_db)):
    # Check DB
    db_status = "Operational"
    try:
        await db.execute(text("SELECT 1"))
    except Exception:
        db_status = "Degraded"

    # Check Androguard
    androguard_ok = False
    try:
        from androguard.core.apk import APK
        androguard_ok = True
    except Exception:
        androguard_ok = False

    ml_info = get_ml_status()
    ml_status_str = "Operational" if ml_info.get("available") else "Offline (Rule-Based Fallback)"

    return SystemHealthResponse(
        status="Healthy" if db_status == "Operational" else "Warning",
        version=settings.VERSION,
        database=db_status,
        ml_service=ml_status_str,
        androguard_available=androguard_ok,
        active_workers=2
    )

@router.get("/model", response_model=ModelStatusResponse)
async def get_model_status_endpoint():
    status = get_ml_status()
    return ModelStatusResponse(
        available=status.get("available", False),
        model_name=status.get("model_name"),
        model_type=status.get("model_type"),
        version=status.get("version"),
        accuracy=status.get("accuracy"),
        precision=status.get("precision"),
        recall=status.get("recall"),
        f1_score=status.get("f1_score"),
        dataset_origin=status.get("dataset_origin"),
        trained_at=status.get("trained_at"),
        feature_count=status.get("feature_count"),
    )

@router.get("/version")
async def get_version_endpoint():
    return {
        "product": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "api_version": "v1",
        "engine": "AppCheck Unified Android Static & Heuristic Intelligence Core",
    }
