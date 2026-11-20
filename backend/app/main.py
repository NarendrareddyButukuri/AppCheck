from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import engine, Base
# Import all models so metadata knows all tables
import backend.app.models  # noqa: F401

from backend.app.api.v1.auth import router as auth_router
from backend.app.api.v1.scans import router as scans_router
from backend.app.api.v1.reports import router as reports_router
from backend.app.api.v1.dashboard import router as dashboard_router
from backend.app.api.v1.system import router as system_router
from backend.app.api.v1.users import router as users_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables initialized successfully.")
    yield
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Universal Android Security Intelligence Platform API - Know what an app can access.",
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows Vite dev server & production client
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include v1 Routers
api_v1_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_v1_prefix)
app.include_router(scans_router, prefix=api_v1_prefix)
app.include_router(reports_router, prefix=api_v1_prefix)
app.include_router(dashboard_router, prefix=api_v1_prefix)
app.include_router(system_router, prefix=api_v1_prefix)
app.include_router(users_router, prefix=api_v1_prefix)

@app.get("/")
async def root():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "status": "Operational",
        "docs": "/api/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
