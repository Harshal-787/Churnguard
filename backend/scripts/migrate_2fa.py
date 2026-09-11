import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from app.database import SessionLocal, engine
from app.models import Base
from sqlalchemy import text

def migrate():
    print("Migrating database for 2FA...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        db.execute(text("ALTER TABLE users ADD COLUMN two_factor_code VARCHAR"))
    except Exception as e:
        print(f"Skipping two_factor_code: {e}")
        
    try:
        db.execute(text("ALTER TABLE users ADD COLUMN two_factor_expires_at TIMESTAMP WITH TIME ZONE"))
    except Exception as e:
        print(f"Skipping two_factor_expires_at: {e}")
        
    db.commit()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
