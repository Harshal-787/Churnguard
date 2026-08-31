from app.database import SessionLocal
from sqlalchemy import text

db = SessionLocal()
try:
    print("Terminating other connections...")
    db.execute(text("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = current_database() AND pid <> pg_backend_pid();"))
    db.commit()
    print("Done")
except Exception as e:
    print("Error:", e)
