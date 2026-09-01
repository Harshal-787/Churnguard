from app.database import SessionLocal
from app.models import Customer, PredictionHistory

db = SessionLocal()
org_id = 2

customer_ids = [c.id for c in db.query(Customer.id).filter(Customer.organization_id == org_id).all()]
print("Found", len(customer_ids), "customers")

deleted_history = 0
deleted_customers = 0

if customer_ids:
    chunk_size = 10000
    # Delete prediction history first due to foreign keys
    for i in range(0, len(customer_ids), chunk_size):
        chunk = customer_ids[i:i+chunk_size]
        deleted_history += db.query(PredictionHistory).filter(PredictionHistory.customer_db_id.in_(chunk)).delete(synchronize_session=False)
        print("deleted history chunk:", i)
    
    # Delete customers
    for i in range(0, len(customer_ids), chunk_size):
        chunk = customer_ids[i:i+chunk_size]
        deleted_customers += db.query(Customer).filter(Customer.id.in_(chunk)).delete(synchronize_session=False)
        print("deleted customers chunk:", i)
        
db.commit()
print("Success history:", deleted_history)
print("Success customers:", deleted_customers)
