import pandas as pd
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Request
from sqlalchemy.orm import Session

from ..models import User, PredictionHistory, Customer, AuditLog
from ..deps import get_db, get_current_user, require_role
from ..schemas import RoleEnum
from ml.models.inference import ChurnPredictor
from ml.models.explain import explain_batch
from ..llm_agent import generate_retention_strategy

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

upload_progress: dict[int, dict[str, int]] = {}

@router.get("/batch/csv/progress")
def get_upload_progress(current_user: User = Depends(get_current_user)):
    return upload_progress.get(current_user.organization_id, {"current": 0, "total": 0})


_predictors: dict[str, ChurnPredictor] = {}
def get_predictor() -> ChurnPredictor:
    from .models import get_active_model_filename
    model_filename = get_active_model_filename()
    if model_filename not in _predictors:
        _predictors[model_filename] = ChurnPredictor(model_filename)
    return _predictors[model_filename]

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

@router.post("/strategy/{customer_id}")
def get_customer_strategy(
    customer_id: str,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    log_audit(db, current_user, f"Generated LLM Strategy for {customer_id}", "/api/v1/predict/strategy", request)
    
    # 1. Fetch customer and prediction history
    cust = db.query(Customer).filter(
        Customer.customer_id == customer_id,
        Customer.organization_id == current_user.organization_id
    ).first()
    
    if not cust:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    history = db.query(PredictionHistory).filter(
        PredictionHistory.customer_db_id == cust.id
    ).order_by(PredictionHistory.created_at.desc()).first()
    
    if not history:
        raise HTTPException(status_code=404, detail="No prediction history for customer")
        
    # 2. Return cached if exists and valid
    if history.llm_strategy and "error" not in history.llm_strategy:
        strategy = history.llm_strategy
    else:
        # 3. Generate new strategy
        cust_dict = {
            c.name: getattr(cust, c.name) for c in cust.__table__.columns
            if c.name not in ["id", "organization_id", "created_at"]
        }
        
        strategy = generate_retention_strategy(cust_dict, history.top_factors or [])
        
        # 4. Save only if successful
        if "error" not in strategy:
            history.llm_strategy = strategy
            db.commit()
        else:
            raise HTTPException(status_code=500, detail=strategy["error"])

    # 5. Format and inject dynamic properties for the frontend
    if "analysis" in strategy and "action_plan" not in strategy:
        strategy["action_plan"] = strategy["analysis"] + " " + " ".join(strategy.get("action_items", []))
    if "risk_factor" not in strategy:
        strategy["risk_factor"] = "Derived from historical signals"
        
    strategy["retention_prob"] = round((1.0 - history.probability) * 100, 1)

    return strategy

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
def predict_batch_csv(
    request: Request,
    file: UploadFile = File(...),
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    try:
        log_audit(db, current_user, "Batch Prediction CSV", "/api/v1/predict/batch/csv", request)
        
        if not file.filename.endswith(".csv"):
            raise HTTPException(status_code=400, detail="File must be a CSV")
        
        contents = file.file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        # Run predictions
        predictor = get_predictor()
        result_df = predictor.predict(df)
        
        org_id = current_user.organization_id
        
        # Pre-fetch existing customer IDs
        existing_cust_ids = {c.customer_id for c in db.query(Customer.customer_id).filter_by(organization_id=org_id).all()}
        
        # Optimize iteration: iterrows is extremely slow for 165k rows, use to_dict
        records = result_df.to_dict(orient="records")
        customers_to_add = []
        
        for i, row in enumerate(records):
            cust_id = str(row.get("CustomerId", row.get("customer_id", f"CUST-{org_id}-{i}")))
            if cust_id in existing_cust_ids:
                continue
                
            customers_to_add.append({
                "customer_id": cust_id,
                "organization_id": org_id,
                "geography": row.get("Geography", "Unknown"),
                "age": int(row.get("Age", row.get("age", 30))),
                "tenure_months": int(row.get("Tenure", row.get("tenure_months", 0))),
                "num_products": int(row.get("NumOfProducts", row.get("num_products", 1))),
                "has_credit_card": int(row.get("HasCrCard", row.get("has_credit_card", 0))),
                "is_active_member": int(row.get("IsActiveMember", row.get("is_active_member", 0))),
                "avg_balance": float(row.get("Balance", row.get("avg_balance", 0.0))),
                "monthly_transactions": int(row.get("monthly_transactions", 10)),
                "support_tickets_last_90d": int(row.get("support_tickets_last_90d", 0)),
                "balance_trend_pct": float(row.get("balance_trend_pct", 0.0)),
                "days_since_last_login": int(row.get("days_since_last_login", 0)),
                "salary_band": (
                    "low" if float(row.get("EstimatedSalary", row.get("salary", 50000))) < 50000 
                    else "mid" if float(row.get("EstimatedSalary", row.get("salary", 50000))) < 100000
                    else "high" if float(row.get("EstimatedSalary", row.get("salary", 50000))) < 150000
                    else "ultra-high"
                ),
                "channel": row.get("channel", "web"),
                # Store prob/pred directly for History pass
                "_prob": float(row.get("churn_probability", 0)),
                "_pred": int(row.get("churn_prediction", 0))
            })
            
        if not customers_to_add:
            return {"status": "success", "message": "No new customers to insert."}
            
        total_work = len(customers_to_add) * 2
        upload_progress[org_id] = {"current": 0, "total": total_work}
            
        # 1. Bulk Insert Customers and return IDs
        # We need to map DB IDs to generate History, so we use core insert with returning
        from sqlalchemy import insert
        
        inserted_ids = []
        chunk_size = 2000
        
        for i in range(0, len(customers_to_add), chunk_size):
            chunk = customers_to_add[i:i+chunk_size]
            stmt = insert(Customer).values([{k: v for k, v in c.items() if not k.startswith("_")} for c in chunk]).returning(Customer.id)
            result = db.execute(stmt)
            inserted_ids.extend([row[0] for row in result])
            upload_progress[org_id]["current"] = i + len(chunk)
        
        # 2. Bulk Insert Prediction History
        histories_to_add = []
        for db_id, cust in zip(inserted_ids, customers_to_add):
            prob = cust["_prob"]
            histories_to_add.append({
                "customer_db_id": db_id,
                "model_id": 1,
                "probability": prob,
                "prediction": cust["_pred"],
                "risk_tier": _risk_tier(prob)
            })
            
        for i in range(0, len(histories_to_add), chunk_size):
            chunk = histories_to_add[i:i+chunk_size]
            history_stmt = insert(PredictionHistory).values(chunk)
            db.execute(history_stmt)
            upload_progress[org_id]["current"] = len(customers_to_add) + i + len(chunk)
            
        db.commit()
        upload_progress.pop(org_id, None)
        
        if len(result_df) > 5000:
            return {"status": "success", "message": f"Successfully processed and uploaded {len(customers_to_add)} customers."}
        
        result_df["risk_tier"] = result_df["churn_probability"].apply(_risk_tier)
        return result_df.to_dict(orient="records")
    except Exception as e:
        org_id = getattr(current_user, "organization_id", None)
        if org_id:
            upload_progress.pop(org_id, None)
        import traceback
        err_msg = traceback.format_exc()
        raise HTTPException(status_code=500, detail=str(err_msg))

@router.get("/batch/test_reanalyze")
def test_reanalyze(db: Session = Depends(get_db)):
    try:
        first_cust = db.query(Customer).first()
        if not first_cust:
            return {"status": "success", "message": "No customers in db."}
        org_id = first_cust.organization_id
        customers = db.query(Customer).filter_by(organization_id=org_id).limit(5).all()
        if not customers:
            return {"status": "success", "message": "No customers."}
            
        records = []
        for c in customers:
            d = c.__dict__.copy()
            sal = 100000.0
            band = d.get("salary_band")
            if band == "low": sal = 40000.0
            elif band == "mid": sal = 75000.0
            elif band == "high": sal = 125000.0
            elif band == "ultra-high": sal = 200000.0
                
            mapped = {
                "id": d["id"],
                "Geography": d.get("geography", "Unknown"),
                "Age": d.get("age", 30),
                "Tenure": d.get("tenure_months", 0),
                "Balance": d.get("avg_balance", 0.0),
                "NumOfProducts": d.get("num_products", 1),
                "HasCrCard": d.get("has_credit_card", 0),
                "IsActiveMember": d.get("is_active_member", 0),
                "EstimatedSalary": sal,
                "Gender": "Unknown",
                "CreditScore": 650,
            }
            records.append(mapped)
            
        df = pd.DataFrame.from_records(records)
        
        from ml.models.inference import ChurnPredictor
        pred1 = ChurnPredictor("churn_pipeline.joblib")
        pred2 = ChurnPredictor("bank_churners_pipeline.joblib")
        
        res1 = pred1.predict(df.drop(columns=["id"]))
        res2 = pred2.predict(df.drop(columns=["id"]))
        
        return {
            "status": "success", 
            "churn_prob": list(res1["churn_probability"].head(3)),
            "bank_prob": list(res2["churn_probability"].head(3))
        }
    except Exception as e:
        import traceback
        return {"error": traceback.format_exc()}

@router.post("/batch/reanalyze")
def reanalyze_all(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        log_audit(db, current_user, "Bulk Reanalyze Customers", "/api/v1/predict/batch/reanalyze", request)
        org_id = current_user.organization_id
        
        # 1. Fetch all customers for this org
        customers = db.query(Customer).filter_by(organization_id=org_id).all()
        if not customers:
            return {"status": "success", "message": "No customers to reanalyze."}
            
        # 2. Convert to DataFrame and map to ML feature names
        records = []
        for c in customers:
            d = c.__dict__.copy()
            
            # Estimate salary back from band
            sal = 100000.0
            band = d.get("salary_band")
            if band == "low": sal = 40000.0
            elif band == "mid": sal = 75000.0
            elif band == "high": sal = 125000.0
            elif band == "ultra-high": sal = 200000.0
                
            mapped = {
                "id": d["id"],
                "Geography": d.get("geography", "Unknown"),
                "Age": d.get("age", 30),
                "Tenure": d.get("tenure_months", 0),
                "Balance": d.get("avg_balance", 0.0),
                "NumOfProducts": d.get("num_products", 1),
                "HasCrCard": d.get("has_credit_card", 0),
                "IsActiveMember": d.get("is_active_member", 0),
                "EstimatedSalary": sal,
                "Gender": "Unknown", # Not in DB, required by pipeline
                "CreditScore": 650,  # Not in DB, required by pipeline
            }
            records.append(mapped)
            
        df = pd.DataFrame.from_records(records)
        
        # 3. Predict using active model
        # The sklearn pipeline uses make_column_selector(dtype_include=np.number)
        # If we leave 'id' in, it will be scaled and cause a ValueError (feature count mismatch)
        customer_ids = df["id"].copy()
        
        predictor = get_predictor()
        result_df = predictor.predict(df.drop(columns=["id"]))
        result_df["id"] = customer_ids
        
        # 3.5 Generate SHAP explanations ONLY for high risk (prob >= 0.6) to save time
        from ml.models.explain import explain_batch
        
        high_risk_indices = result_df[result_df["churn_probability"] >= 0.6].index
        if len(high_risk_indices) > 0:
            high_risk_raw = df.loc[high_risk_indices].drop(columns=["id"])
            high_risk_explanations = explain_batch(high_risk_raw)
            # Create mapping
            explanations_map = {idx: exp for idx, exp in zip(high_risk_indices, high_risk_explanations)}
        else:
            explanations_map = {}
        
        # 4. Clear out old prediction history for these customers so dashboard counts are accurate
        subq = db.query(Customer.id).filter(Customer.organization_id == org_id).subquery()
        db.query(PredictionHistory).filter(PredictionHistory.customer_db_id.in_(subq)).delete(synchronize_session=False)
        
        # 5. Prepare PredictionHistory records
        from sqlalchemy import insert
        histories_to_add = []
        
        for idx, row in result_df.iterrows():
            prob = float(row["churn_probability"])
            histories_to_add.append({
                "customer_db_id": int(row["id"]), # We kept id from DB
                "model_id": 1,
                "probability": prob,
                "prediction": int(row["churn_prediction"]),
                "risk_tier": _risk_tier(prob),
                "top_factors": explanations_map.get(idx, {}).get("top_factors")
            })
            
        # 5. Bulk insert in chunks
        chunk_size = 5000
        for i in range(0, len(histories_to_add), chunk_size):
            chunk = histories_to_add[i:i+chunk_size]
            db.execute(insert(PredictionHistory).values(chunk))
            
        db.commit()
        return {"status": "success", "reanalyzed_count": len(histories_to_add)}
        
    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        raise HTTPException(status_code=500, detail=str(err_msg))

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
