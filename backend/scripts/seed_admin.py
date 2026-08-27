import os
import sys

# Add /app to path (default in docker)
sys.path.insert(0, '/app')

from app.database import SessionLocal, engine, Base
from app.models import User, Organization, RoleEnum
from app.auth import get_password_hash

def seed():
    # Ensure tables are created
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Create System Org if it doesn't exist
        org = db.query(Organization).filter_by(name='System').first()
        if not org:
            org = Organization(name='System')
            db.add(org)
            db.commit()
            db.refresh(org)
            print("Created System organization.")
        else:
            print("System organization already exists.")

        # Create Admin User if it doesn't exist
        admin = db.query(User).filter_by(email='admin@churnguard.com').first()
        if not admin:
            admin = User(
                email='admin@churnguard.com',
                hashed_password=get_password_hash('admin123'),
                full_name='Super Admin',
                role=RoleEnum.SUPER_ADMIN,
                organization_id=org.id
            )
            db.add(admin)
            db.commit()
            print("Super Admin seeded successfully! Email: admin@churnguard.com / Password: admin123")
        else:
            print("Super Admin already exists!")
            
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
