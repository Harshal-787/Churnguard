from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User, Customer, PredictionHistory
from ..deps import get_current_user

router = APIRouter()

@router.get("/")
def get_customers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org_id = current_user.organization_id
    customers = db.query(Customer).filter_by(organization_id=org_id).all()
    
    results = []
    for c in customers:
        # Get latest prediction
        p = db.query(PredictionHistory).filter_by(customer_db_id=c.id).order_by(PredictionHistory.created_at.desc()).first()
        risk_score = p.probability if p else 0.0
        
        results.append({
            "id": c.customer_id,
            "name": f"Customer {c.customer_id}",
            "geography": "Unknown", # Add geography to Customer model if needed, but for now mock or leave as Unknown
            "balance": c.avg_balance,
            "riskScore": risk_score
        })
        
    return sorted(results, key=lambda x: x["riskScore"], reverse=True)

@router.get("/{customer_id}")
def get_customer_detail(
    customer_id: str, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org_id = current_user.organization_id
    c = db.query(Customer).filter_by(organization_id=org_id, customer_id=customer_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    p = db.query(PredictionHistory).filter_by(customer_db_id=c.id).order_by(PredictionHistory.created_at.desc()).first()
    risk_score = p.probability if p else 0.0

    return {
        "id": c.customer_id,
        "name": f"Customer {c.customer_id}",
        "geography": "Unknown",
        "age": c.age,
        "tenure": c.tenure_months,
        "balance": c.avg_balance,
        "salary": 85000,
        "products": c.num_products,
        "active": c.is_active_member == 1,
        "creditCard": c.has_credit_card == 1,
        "riskScore": risk_score,
        "shapData": [
          { "feature": f'NumOfProducts ({c.num_products})', "impact": 0.35, "direction": 'positive' },
          { "feature": f'IsActiveMember ({c.is_active_member})', "impact": 0.22, "direction": 'positive' },
        ],
        "historicalRisk": [
            { "month": "Current", "score": risk_score }
        ],
        "recommendedActions": [
            "Contact customer via phone to discuss account options",
            "Offer a premium bundled savings account",
        ]
    }
