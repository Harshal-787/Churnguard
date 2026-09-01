import sys
sys.path.append('.')
from backend.app.database import SessionLocal
from backend.app.models import PredictionHistory
import random

db = SessionLocal()
high_risk = db.query(PredictionHistory).filter(PredictionHistory.risk_tier == "high").all()
factors = ["Age", "Geography_Germany", "Balance", "NumOfProducts", "IsActiveMember", "Tenure"]
for h in high_risk:
    top_f = random.sample(factors, 3)
    h.top_factors = [
        {"feature": top_f[0], "impact": round(random.uniform(0.1, 0.4), 4), "direction": "increases risk"},
        {"feature": top_f[1], "impact": round(random.uniform(0.05, 0.15), 4), "direction": "increases risk"}
    ]
db.commit()
print("Done mocking")
