from app.database import SessionLocal
from app.models import PredictionHistory, Customer
from sqlalchemy import func

db = SessionLocal()
org_id = 2

total = db.query(Customer).filter_by(organization_id=org_id).count()

high_risk = db.query(PredictionHistory).join(Customer).filter(
    Customer.organization_id == org_id,
    PredictionHistory.risk_tier == 'high'
).count()

medium_risk = db.query(PredictionHistory).join(Customer).filter(
    Customer.organization_id == org_id,
    PredictionHistory.risk_tier == 'medium'
).count()

low_risk = db.query(PredictionHistory).join(Customer).filter(
    Customer.organization_id == org_id,
    PredictionHistory.risk_tier == 'low'
).count()

avg_prob = db.query(func.avg(PredictionHistory.probability)).join(Customer).filter(
    Customer.organization_id == org_id
).scalar()

print(f"Total Predicted: {total}")
print(f"High Risk: {high_risk}")
print(f"Medium Risk: {medium_risk}")
print(f"Low Risk (Safe): {low_risk}")
print(f"Average Churn Probability: {avg_prob * 100:.2f}%")
