"""
ChurnGuard - Inference API
------------------------------------------------------------
FastAPI service exposing churn prediction endpoints.

To run the API standalone:
1. cd backend
2. uvicorn app.main:app --reload --port 8000
"""

import os
import sys
from pathlib import Path
# Add project root to path so we can import ml module
ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded


from app.routers import auth, predict, dashboard, customers, performance, analytics, organizations, notifications, models
from app.database import engine, Base

# We rely on Alembic for migrations now, but we can ensure tables exist
Base.metadata.create_all(bind=engine)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="ChurnGuard API",
    description="Predictive customer churn detection for FinTech",
    version="1.0.0",
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Tighter CORS for production (example, can be configured via env)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8501"], # typical Next.js, Vite/React, and Streamlit ports
    allow_methods=["*"],
    allow_headers=["*"],
)

os.makedirs("uploads", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

# API Version 1 Routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(predict.router, prefix="/api/v1/predict", tags=["predict"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])
app.include_router(customers.router, prefix="/api/v1/customers", tags=["customers"])
app.include_router(performance.router, prefix="/api/v1/performance", tags=["performance"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(organizations.router, prefix="/api/v1/organizations", tags=["organizations"])
app.include_router(notifications.router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(models.router, prefix="/api/v1/models", tags=["models"])

@app.get("/health")
@limiter.limit("10/minute")
def health(request: Request):
    return {"status": "ok", "api_version": "v1"}

@app.get("/")
def root():
    return {
        "service": "ChurnGuard API",
        "docs": "/docs",
        "endpoints": ["/health", "/api/v1/auth/login", "/api/v1/auth/register", "/api/v1/predict"]
    }
