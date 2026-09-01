from app.database import SessionLocal
from app.routers.analytics import export_analytics
from app.models import User

db = SessionLocal()
user = db.query(User).first()
if not user:
    print("No user")
    exit(1)

try:
    res = export_analytics(format="csv", db=db, current_user=user)
    print("CSV Success")
    res = export_analytics(format="pdf", db=db, current_user=user)
    print("PDF Success")
except Exception as e:
    import traceback
    traceback.print_exc()
