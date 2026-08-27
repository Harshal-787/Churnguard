import sys
import os

# Add backend to path so we can import app modules
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.database import SessionLocal, engine
from app.models import Base, User
from app.auth import get_password_hash

def create_admin():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        admin_email = "admin@churnguard.com"
        existing_user = db.query(User).filter(User.email == admin_email).first()
        
        if existing_user:
            existing_user.hashed_password = get_password_hash("password123")
            existing_user.role = "Super Admin"
            print("Updated existing admin user")
        else:
            new_admin = User(
                email=admin_email,
                hashed_password=get_password_hash("password123"),
                full_name="Super Administrator",
                organization="ChurnGuard HQ",
                role="Super Admin"
            )
            db.add(new_admin)
            print("Created new admin user")
            
        db.commit()
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
