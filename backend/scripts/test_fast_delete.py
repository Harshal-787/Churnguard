from app.database import SessionLocal
from sqlalchemy import text
import time

db = SessionLocal()
org_id = 2

start = time.time()
try:
    print("Deleting history...")
    res1 = db.execute(text("""
        DELETE FROM prediction_history 
        USING customers 
        WHERE prediction_history.customer_db_id = customers.id 
        AND customers.organization_id = :org_id
    """), {"org_id": org_id})
    print("History deleted:", res1.rowcount, "in", time.time() - start)
    
    start = time.time()
    print("Deleting customers...")
    res2 = db.execute(text("""
        DELETE FROM customers 
        WHERE organization_id = :org_id
    """), {"org_id": org_id})
    print("Customers deleted:", res2.rowcount, "in", time.time() - start)
    
    db.commit()
    print("Success!")
except Exception as e:
    print("Error:", e)
