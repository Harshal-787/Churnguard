import os
import sys
import random
import pandas as pd
from datetime import datetime, timedelta

# Add /app to path (default in docker) or project root locally
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from backend.app.database import SessionLocal, engine, Base
from backend.app.models import User, Organization, Customer, PredictionHistory, Model
from ml.models.inference import ChurnPredictor

def _risk_tier(p: float) -> str:
    if p >= 0.6: return "high"
    if p >= 0.3: return "medium"
    return "low"

def seed_customers():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Get all Organizations
        orgs = db.query(Organization).all()
        if not orgs:
            print("No organizations found! Run seed_admin.py first.")
            return
            
        print(f"Generating 250 synthetic customers for {len(orgs)} organizations...")
        
        # Get or create Model 1
        model = db.query(Model).filter_by(id=1).first()
        if not model:
            model = Model(name="Production XGBoost v1", version="1.0", model_type="xgboost", is_active=True, organization_id=orgs[0].id)
            db.add(model)
            db.commit()
            db.refresh(model)

        print("Clearing old mock data...")
        db.query(PredictionHistory).delete()
        db.query(Customer).delete()
        db.commit()
        
        geographies = ["France", "Germany", "Spain"]
        salary_bands = ["< $50k", "$50k - $100k", "$100k - $150k", "> $150k"]
        channels = ["mobile_app", "web", "branch"]

        for org in orgs:
            customers = []
            for i in range(1, 251):
                c = {
                    "customer_id": f"CUST{100000+i}",
                    "age": random.randint(18, 75),
                    "tenure_months": random.randint(0, 120),
                    "num_products": random.choices([1, 2, 3, 4], weights=[50, 40, 8, 2])[0],
                    "has_credit_card": random.choices([0, 1], weights=[30, 70])[0],
                    "is_active_member": random.choices([0, 1], weights=[45, 55])[0],
                    "avg_balance": round(random.uniform(0, 200000), 2),
                    "monthly_transactions": random.randint(0, 50),
                    "support_tickets_last_90d": random.choices([0, 1, 2, 3, 4], weights=[60, 20, 10, 5, 5])[0],
                    "balance_trend_pct": round(random.uniform(-20, 20), 2),
                    "days_since_last_login": random.randint(0, 90),
                    "salary_band": random.choice(salary_bands),
                    "channel": random.choice(channels),
                    # Needed for model inference which expects original dataset names
                    "CreditScore": random.randint(400, 850),
                    "Age": 0, # Will overwrite below
                    "Tenure": 0,
                    "Balance": 0,
                    "NumOfProducts": 0,
                    "HasCrCard": 0,
                    "IsActiveMember": 0,
                    "EstimatedSalary": round(random.uniform(20000, 200000), 2),
                    "Geography": random.choice(geographies),
                    "Gender": random.choice(["Male", "Female"])
                }
                # Sync model schema with DB schema fields
                c["Age"] = c["age"]
                c["Tenure"] = c["tenure_months"]
                c["Balance"] = c["avg_balance"]
                c["NumOfProducts"] = c["num_products"]
                c["HasCrCard"] = c["has_credit_card"]
                c["IsActiveMember"] = c["is_active_member"]
                
                # Tweak logic so some churn heavily (e.g. Germany, Female, High Age, High Balance, Inactive)
                if c["Geography"] == "Germany" and c["Age"] > 45 and c["IsActiveMember"] == 0:
                    c["Balance"] += 50000
                    c["avg_balance"] += 50000
                    
                customers.append(c)

            # Run Predictions
            predictor = ChurnPredictor()
            df_raw = pd.DataFrame(customers)
            df_results = predictor.predict(df_raw)

            print(f"Saving to DB for Organization: {org.name}...")
            for i, row in df_results.iterrows():
                orig = customers[i]
                
                db_cust = Customer(
                    customer_id=orig["customer_id"],
                    organization_id=org.id,
                    geography=orig["Geography"],
                    age=orig["age"],
                    tenure_months=orig["tenure_months"],
                    num_products=orig["num_products"],
                    has_credit_card=orig["has_credit_card"],
                    is_active_member=orig["is_active_member"],
                    avg_balance=orig["avg_balance"],
                    monthly_transactions=orig["monthly_transactions"],
                    support_tickets_last_90d=orig["support_tickets_last_90d"],
                    balance_trend_pct=orig["balance_trend_pct"],
                    days_since_last_login=orig["days_since_last_login"],
                    salary_band=orig["salary_band"],
                    channel=orig["channel"]
                )
                db.add(db_cust)
                db.flush() # get id
                
                prob = float(row["churn_probability"])
                pred = int(row["churn_prediction"])
                
                history = PredictionHistory(
                    customer_db_id=db_cust.id,
                    model_id=model.id,
                    probability=prob,
                    prediction=pred,
                    risk_tier=_risk_tier(prob),
                    top_factors={} # Skip shap for seeding speed
                )
                db.add(history)
                
        db.commit()
        print(f"Successfully seeded {len(orgs) * 250} customers and predictions!")
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_customers()
