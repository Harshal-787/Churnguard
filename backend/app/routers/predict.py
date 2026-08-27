import pandas as pd
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.orm import Session

from ..models import User, PredictionHistory, Customer, AuditLog
from ..deps import get_db, get_current_user, require_role
from ..schemas import RoleEnum
from ml.models.inference import ChurnPredictor
from ml.models.explain import explain_batch

# Avoid circular imports in main.py by defining schemas here for prediction
from pydantic import BaseModel, Field

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
    if p >= 0.6: return "high"
    if p >= 0.3: return "medium"
    return "low"

router = APIRouter()

_predictor: ChurnPredictor | None = None
def get_predictor() -> ChurnPredictor:
    global _predictor
    if _predictor is None:
        _predictor = ChurnPredictor()
    return _predictor

def log_audit(db: Session, user: User, action: str, endpoint: str, request: Request):
    log = AuditLog(
        user_id=user.id,
        action=action,
        endpoint=endpoint,
        ip_address=request.client.host if request.client else None
    )
    db.add(log)
    db.commit()

@router.post("", response_model=PredictionResponse)
def predict_single(
    request: Request,
    customer: CustomerRecord, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    log_audit(db, current_user, "Single Prediction", "/api/v1/predict", request)
    
    predictor = get_predictor()
    df = pd.DataFrame([customer.model_dump()])
    result = predictor.predict(df).iloc[0]
    
    prob = float(result["churn_probability"])
    pred = int(result["churn_prediction"])
    tier = _risk_tier(prob)
    
    # Check if customer exists in DB for this org, if not create
    db_cust = db.query(Customer).filter(
        Customer.customer_id == customer.customer_id, 
        Customer.organization_id == current_user.organization_id
    ).first()
    
    if not db_cust:
        db_cust = Customer(
            customer_id=customer.customer_id,
            organization_id=current_user.organization_id,
            **customer.model_dump()
        )
        db.add(db_cust)
        db.flush()
        
    # Save Prediction History
    history = PredictionHistory(
        customer_db_id=db_cust.id,
        model_id=1, # Mock for now until dynamic models are added in Phase 2
        probability=prob,
        prediction=pred,
        risk_tier=tier
    )
    db.add(history)
    db.commit()
    
    return PredictionResponse(
        customer_id=result["customer_id"],
        churn_probability=prob,
        churn_prediction=pred,
        risk_tier=tier,
    )

@router.post("/batch", response_model=list[PredictionResponse])
def predict_batch(
    request: Request,
    batch_req: BatchPredictionRequest,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    log_audit(db, current_user, "Batch Prediction JSON", "/api/v1/predict/batch", request)
    
    predictor = get_predictor()
    df = pd.DataFrame([c.model_dump() for c in batch_req.customers])
    result = predictor.predict(df)
    
    responses = []
    for _, row in result.iterrows():
        responses.append(PredictionResponse(
            customer_id=row["customer_id"],
            churn_probability=float(row["churn_probability"]),
            churn_prediction=int(row["churn_prediction"]),
            risk_tier=_risk_tier(float(row["churn_probability"]))
        ))
    return responses

@router.post("/batch/csv")
async def predict_batch_csv(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    log_audit(db, current_user, "Batch Prediction CSV", "/api/v1/predict/batch/csv", request)
    
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    contents = await file.read()
    df = pd.read_csv(io.BytesIO(contents))
    
    # Run predictions
    predictor = get_predictor()
    result_df = predictor.predict(df)
    
    # Save to DB
    org_id = current_user.organization_id
    
    # Pre-fetch existing customer IDs to avoid duplicates/errors
    existing_cust_ids = {c.customer_id for c in db.query(Customer.customer_id).filter_by(organization_id=org_id).all()}
    
    customers_to_add = []
    histories_to_add = []
    
    for i, row in result_df.iterrows():
        cust_id = str(row.get("customer_id", f"CUST-{org_id}-{i}"))
        
        # We skip saving if the customer_id already exists for simplicity in this batch upload
        if cust_id in existing_cust_ids:
            continue
            
        # Parse fields with fallbacks if CSV is missing them
        db_cust = Customer(
            customer_id=cust_id,
            organization_id=org_id,
            geography=row.get("Geography", "Unknown"),
            age=int(row.get("Age", row.get("age", 30))),
            tenure_months=int(row.get("Tenure", row.get("tenure_months", 0))),
            num_products=int(row.get("NumOfProducts", row.get("num_products", 1))),
            has_credit_card=int(row.get("HasCrCard", row.get("has_credit_card", 0))),
            is_active_member=int(row.get("IsActiveMember", row.get("is_active_member", 0))),
            avg_balance=float(row.get("Balance", row.get("avg_balance", 0.0))),
            monthly_transactions=int(row.get("monthly_transactions", 10)),
            support_tickets_last_90d=int(row.get("support_tickets_last_90d", 0)),
            balance_trend_pct=float(row.get("balance_trend_pct", 0.0)),
            days_since_last_login=int(row.get("days_since_last_login", 0)),
            salary_band=row.get("salary_band", "mid"),
            channel=row.get("channel", "web")
        )
        db.add(db_cust)
        db.flush() # Need ID for history
        
        prob = float(row["churn_probability"])
        pred = int(row["churn_prediction"])
        tier = _risk_tier(prob)
        
        history = PredictionHistory(
            customer_db_id=db_cust.id,
            model_id=1,
            probability=prob,
            prediction=pred,
            risk_tier=tier
        )
        db.add(history)
        
    db.commit()
    
    result_df["risk_tier"] = result_df["churn_probability"].apply(_risk_tier)
    return result_df.to_dict(orient="records")

@router.post("/explain")
def explain(
    request: Request,
    customer: CustomerRecord, 
    top_n: int = 5,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    log_audit(db, current_user, "Explain Prediction", "/api/v1/predict/explain", request)
    df = pd.DataFrame([customer.model_dump()])
    return explain_batch(df, top_n=top_n)[0]
