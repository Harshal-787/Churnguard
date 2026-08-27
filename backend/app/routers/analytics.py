from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Customer, PredictionHistory
from ..deps import get_current_user

router = APIRouter()

@router.get("/")
def get_analytics_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org_id = current_user.organization_id
    
    # Simple query fetching joined data (could use GROUP BY in SQL for performance later)
    predictions = db.query(PredictionHistory, Customer).join(Customer).filter(Customer.organization_id == org_id).all()
    
    # Init buckets
    geo_stats = {}
    salary_stats = {}
    risk_buckets = {f"{i/10:.1f}-{i/10+0.1:.1f}": 0 for i in range(10)}
    
    for p, c in predictions:
        # Geography
        if c.geography:
            geo_stats.setdefault(c.geography, {"safe": 0, "atRisk": 0})
            if p.risk_tier == "high":
                geo_stats[c.geography]["atRisk"] += 1
            else:
                geo_stats[c.geography]["safe"] += 1
                
        # Salary Band
        if c.salary_band:
            salary_stats.setdefault(c.salary_band, {"safe": 0, "atRisk": 0})
            if p.risk_tier == "high":
                salary_stats[c.salary_band]["atRisk"] += 1
            else:
                salary_stats[c.salary_band]["safe"] += 1
                
        # Risk Histogram
        bucket_idx = min(int(p.probability * 10), 9)
        bucket_key = f"{bucket_idx/10:.1f}-{bucket_idx/10+0.1:.1f}"
        risk_buckets[bucket_key] += 1

    return {
        "geography": [
            {"name": k, "safe": v["safe"], "atRisk": v["atRisk"]} for k, v in geo_stats.items()
        ],
        "salaryBands": [
            {"name": k, "safe": v["safe"], "atRisk": v["atRisk"]} for k, v in salary_stats.items()
        ],
        "riskHistogram": [
            {"bucket": k, "count": v} for k, v in risk_buckets.items()
        ],
        "cohorts": [
            {"cohort": "Q1 2024", "m1": 98, "m3": 95, "m6": 92, "m12": 88},
            {"cohort": "Q2 2024", "m1": 99, "m3": 96, "m6": 91, "m12": 87}
        ] if len(predictions) > 0 else []
    }
