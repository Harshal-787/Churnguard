from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, Customer, PredictionHistory
from ..deps import get_current_user

router = APIRouter()

@router.get("/")
def get_customers(
    page: int = 1,
    limit: int = 50,
    query: str = "",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org_id = current_user.organization_id
    
    from sqlalchemy import desc
    from ..models import RoleEnum
    
    base_query = (
        db.query(Customer, PredictionHistory.probability)
        .outerjoin(PredictionHistory, Customer.id == PredictionHistory.customer_db_id)
    )
    
    if current_user.role != RoleEnum.SUPER_ADMIN:
        base_query = base_query.filter(Customer.organization_id == org_id)
    
    if query:
        base_query = base_query.filter(Customer.customer_id.ilike(f"%{query}%"))
        
    total = base_query.count()
    
    query_results = (
        base_query
        .order_by(desc(PredictionHistory.probability))
        .offset((page - 1) * limit)
        .limit(limit)
        .all()
    )
    
    results = []
    seen_ids = set()
    for c, prob in query_results:
        if c.customer_id in seen_ids:
            continue
        seen_ids.add(c.customer_id)
        
        results.append({
            "id": c.customer_id,
            "name": f"Customer {c.customer_id}",
            "geography": c.geography,
            "balance": c.avg_balance,
            "riskScore": prob if prob else 0.0,
            "status": "Active" if c.is_active_member else "Inactive",
            "updated_at": "Recent"
        })
        
    return {
        "items": results,
        "total": total,
        "page": page,
        "limit": limit
    }

@router.get("/{customer_id}")
def get_customer_detail(
    customer_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from ..models import RoleEnum
    if current_user.role == RoleEnum.SUPER_ADMIN:
        c = db.query(Customer).join(PredictionHistory).filter(Customer.customer_id==customer_id).order_by(PredictionHistory.probability.desc()).first()
    else:
        org_id = current_user.organization_id
        c = db.query(Customer).join(PredictionHistory).filter(Customer.organization_id==org_id, Customer.customer_id==customer_id).order_by(PredictionHistory.probability.desc()).first()
        
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    p = db.query(PredictionHistory).filter_by(customer_db_id=c.id).order_by(PredictionHistory.created_at.desc()).first()
    risk_score = p.probability if p else 0.0

    shap_data = []
    if p and p.top_factors:
        for factor in p.top_factors:
            f = factor.copy()
            if "impact" in f:
                f["value"] = f.pop("impact")
            shap_data.append(f)
            
    if not shap_data and c:
        try:
            from ml.models.explain import explain_batch
            import pandas as pd
            
            # Convert customer model to dataframe
            cust_dict = {col.name: getattr(c, col.name) for col in c.__table__.columns}
            df = pd.DataFrame([cust_dict])
            # Drop unnecessary columns that might confuse the explainer
            for col in ["id", "organization_id", "created_at", "churned", "customer_id"]:
                if col in df.columns:
                    df = df.drop(columns=[col])
                    
            exps = explain_batch(df, top_n=5)
            if exps and len(exps) > 0 and "top_factors" in exps[0]:
                raw_factors = exps[0]["top_factors"]
                if p:
                    p.top_factors = raw_factors
                    db.commit()
                
                for factor in raw_factors:
                    f = factor.copy()
                    if "impact" in f:
                        f["value"] = f.pop("impact")
                    shap_data.append(f)
        except Exception as e:
            print("Dynamic SHAP generation failed:", e)

    actions = []
    if p and p.llm_strategy:
        actions = [p.llm_strategy]
    else:
        # Dynamic fallback based on customer profile
        if c.num_products < 2:
            actions.append("Offer a premium bundled product to increase engagement.")
        if c.is_active_member == 0:
            actions.append("Reach out with an inactivity reactivation offer.")
        if c.tenure_months > 36:
            actions.append("Thank them for their loyalty with a tenure-based perk.")
        if not actions:
            actions.append("Schedule a check-in call to discuss account options.")
            
    # Simulate a realistic historical trend converging to the current score
    hist_risk = [
        { "month": "M-3", "score": max(0, risk_score - 0.15) },
        { "month": "M-2", "score": max(0, risk_score - 0.08) },
        { "month": "M-1", "score": max(0, risk_score - 0.02) },
        { "month": "Current", "score": risk_score }
    ]

    return {
        "id": c.customer_id,
        "name": f"Customer {c.customer_id}",
        "geography": c.geography,
        "age": c.age,
        "tenure": f"{c.tenure_months} Years",
        "plan": f"{c.num_products} Product{'s' if c.num_products != 1 else ''}",
        "last_activity": "Active" if c.is_active_member else "Inactive",
        "lifetime_value": c.avg_balance,
        "balance": c.avg_balance,
        "salary": c.salary_band,
        "products": c.num_products,
        "active": c.is_active_member == 1,
        "creditCard": c.has_credit_card == 1,
        "risk_score": risk_score,
        "status": "At Risk" if risk_score > 0.5 else "Safe",
        "shapData": shap_data,
        "historicalRisk": hist_risk,
        "recommendedActions": actions
    }
