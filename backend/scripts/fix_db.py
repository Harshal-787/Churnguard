from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    print("Creating index...")
    db.execute(text("CREATE INDEX IF NOT EXISTS ix_prediction_history_customer_db_id ON prediction_history(customer_db_id);"))
    db.commit()
    print("Done")
except Exception as e:
    print("Error:", e)
