import sys
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

from app.database import SessionLocal, engine
from app.models import Base
from sqlalchemy import text

def migrate():
    print("Migrating database...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Add columns to organizations if they don't exist
        db.execute(text("ALTER TABLE organizations ADD COLUMN require_2fa BOOLEAN DEFAULT FALSE"))
    except Exception as e:
        print(f"Skipping require_2fa: {e}")
        
    try:
        db.execute(text("ALTER TABLE organizations ADD COLUMN session_timeout VARCHAR DEFAULT '15 Minutes'"))
    except Exception as e:
        print(f"Skipping session_timeout: {e}")
        
    db.commit()
    print("Migration complete!")

if __name__ == "__main__":
    migrate()
