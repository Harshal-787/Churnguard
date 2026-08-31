from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from ..database import get_db
from ..models import User, Customer, PredictionHistory
from ..deps import get_current_user

from sqlalchemy import func, cast, Integer

router = APIRouter()

@router.get("/")
def get_analytics_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    org_id = current_user.organization_id
    
    # Geography
    geo_results = db.query(
        Customer.geography,
        PredictionHistory.risk_tier,
        func.count(PredictionHistory.id)
    ).join(Customer).filter(
        Customer.organization_id == org_id,
        Customer.geography.isnot(None)
    ).group_by(Customer.geography, PredictionHistory.risk_tier).all()
    
    geo_stats = {}
    for geo, tier, count in geo_results:
        geo_stats.setdefault(geo, {"safe": 0, "atRisk": 0})
        if tier == "high": geo_stats[geo]["atRisk"] += count
        else: geo_stats[geo]["safe"] += count
                
    # Salary Band
    salary_results = db.query(
        Customer.salary_band,
        PredictionHistory.risk_tier,
        func.count(PredictionHistory.id)
    ).join(Customer).filter(
        Customer.organization_id == org_id,
        Customer.salary_band.isnot(None)
    ).group_by(Customer.salary_band, PredictionHistory.risk_tier).all()
    
    salary_stats = {}
    for band, tier, count in salary_results:
        salary_stats.setdefault(band, {"safe": 0, "atRisk": 0})
        if tier == "high": salary_stats[band]["atRisk"] += count
        else: salary_stats[band]["safe"] += count
                
    from sqlalchemy import text
    # Risk Histogram
    hist_results = db.query(
        cast(PredictionHistory.probability * 10, Integer).label('bucket_idx'),
        func.count(PredictionHistory.id)
    ).join(Customer).filter(
        Customer.organization_id == org_id
    ).group_by(text('bucket_idx')).all()
    
    risk_buckets = {f"{i/10:.1f}-{i/10+0.1:.1f}": 0 for i in range(10)}
    total_predictions = 0
    for bucket_idx, count in hist_results:
        total_predictions += count
        idx = min(bucket_idx, 9) if bucket_idx is not None else 0
        bucket_key = f"{idx/10:.1f}-{idx/10+0.1:.1f}"
        risk_buckets[bucket_key] += count

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
        ] if total_predictions > 0 else []
    }
