"""
ChurnGuard - Inference API
------------------------------------------------------------
FastAPI service exposing churn prediction endpoints.

Run locally:
    uvicorn src.api.main:app --reload --port 8000

Docs: http://localhost:8000/docs
"""

import io
import json
import sys
from pathlib import Path

import pandas as pd
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parents[2]
sys.path.append(str(ROOT))

from src.models.explain import explain_batch
from src.models.inference import ChurnPredictor

MODEL_DIR = ROOT / "models"

app = FastAPI(
    title="ChurnGuard API",
    description="Predictive customer churn detection for FinTech",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_predictor: ChurnPredictor | None = None


def get_predictor() -> ChurnPredictor:
    global _predictor
    if _predictor is None:
        _predictor = ChurnPredictor()
    return _predictor


class CustomerRecord(BaseModel):
    customer_id: str = Field(..., json_schema_extra={"example": "CUST100000"})
    age: int = Field(..., ge=18, le=100)
    tenure_months: int = Field(..., ge=0)
    num_products: int = Field(..., ge=1, le=10)
    has_credit_card: int = Field(..., ge=0, le=1)
    is_active_member: int = Field(..., ge=0, le=1)
    avg_balance: float = Field(..., ge=0)
    monthly_transactions: int = Field(..., ge=0)
    support_tickets_last_90d: int = Field(..., ge=0)
    balance_trend_pct: float
    days_since_last_login: int = Field(..., ge=0)
    salary_band: str = Field(..., json_schema_extra={"example": "mid"})
    channel: str = Field(..., json_schema_extra={"example": "mobile_app"})


class PredictionResponse(BaseModel):
    customer_id: str
    churn_probability: float
    churn_prediction: int
    risk_tier: str


class BatchPredictionRequest(BaseModel):
    customers: list[CustomerRecord]


def _risk_tier(p: float) -> str:
    if p >= 0.6:
        return "high"
    if p >= 0.3:
        return "medium"
    return "low"


@app.get("/health")
def health():
    try:
        get_predictor()
        return {"status": "ok", "model_loaded": True}
    except (FileNotFoundError, ValueError, OSError) as e:
        # Expected failure modes: missing model artifacts or a corrupt/incompatible file
        return {"status": "error", "model_loaded": False, "detail": str(e)}


@app.get("/model/metadata")
def model_metadata():
    meta_path = MODEL_DIR / "metadata.json"
    if not meta_path.exists():
        raise HTTPException(status_code=404, detail="Model metadata not found. Train the model first.")
    with open(meta_path) as f:
        return json.load(f)


@app.post("/predict", response_model=PredictionResponse)
def predict_single(customer: CustomerRecord):
    predictor = get_predictor()
    df = pd.DataFrame([customer.model_dump()])
    result = predictor.predict(df).iloc[0]
    return PredictionResponse(
        customer_id=result["customer_id"],
        churn_probability=float(result["churn_probability"]),
        churn_prediction=int(result["churn_prediction"]),
        risk_tier=_risk_tier(float(result["churn_probability"])),
    )


@app.post("/predict/batch", response_model=list[PredictionResponse])
def predict_batch(request: BatchPredictionRequest):
    predictor = get_predictor()
    df = pd.DataFrame([c.model_dump() for c in request.customers])
    result = predictor.predict(df)
    return [
        PredictionResponse(
            customer_id=row["customer_id"],
            churn_probability=float(row["churn_probability"]),
            churn_prediction=int(row["churn_prediction"]),
            risk_tier=_risk_tier(float(row["churn_probability"])),
        )
        for _, row in result.iterrows()
    ]


@app.post("/predict/batch/csv")
async def predict_batch_csv(file: UploadFile = File(...)):  # noqa: B008 (standard FastAPI pattern)
    """Upload a CSV of customer records and get back churn predictions."""
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    predictor = get_predictor()
    result = predictor.predict(df)
    result["risk_tier"] = result["churn_probability"].apply(_risk_tier)
    return result.to_dict(orient="records")


@app.post("/explain")
def explain(customer: CustomerRecord, top_n: int = 5):
    df = pd.DataFrame([customer.model_dump()])
    return explain_batch(df, top_n=top_n)[0]


@app.get("/")
def root():
    return {
        "service": "ChurnGuard API",
        "docs": "/docs",
        "endpoints": ["/health", "/model/metadata", "/predict", "/predict/batch", "/predict/batch/csv", "/explain"],
    }
