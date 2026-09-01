from app.database import SessionLocal
from app.routers.analytics import get_analytics_data
from app.models import User

db = SessionLocal()
user = db.query(User).filter_by(organization_id=2).first()
if not user:
    print("User not found")
else:
    stats = get_analytics_data(db=db, current_user=user)
    print("Stats:", stats)
