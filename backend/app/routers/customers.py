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
    base_query = (
        db.query(Customer, PredictionHistory.probability)
        .outerjoin(PredictionHistory, Customer.id == PredictionHistory.customer_db_id)
        .filter(Customer.organization_id == org_id)
    )
    
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
        if c.id in seen_ids:
            continue
        seen_ids.add(c.id)
        
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
    org_id = current_user.organization_id
    c = db.query(Customer).filter_by(organization_id=org_id, customer_id=customer_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Customer not found")
        
    p = db.query(PredictionHistory).filter_by(customer_db_id=c.id).order_by(PredictionHistory.created_at.desc()).first()
    risk_score = p.probability if p else 0.0

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
        "shapData": [
          { "feature": f'NumOfProducts ({c.num_products})', "value": 0.35, "direction": 'positive' },
          { "feature": f'Age ({c.age})', "value": 0.28, "direction": 'positive' },
          { "feature": f'IsActiveMember ({"Yes" if c.is_active_member else "No"})', "value": -0.22, "direction": 'negative' },
        ],
        "historicalRisk": [
            { "month": "Current", "score": risk_score }
        ],
        "recommendedActions": [
            "Contact customer via phone to discuss account options",
            "Offer a premium bundled savings account",
        ]
    }
