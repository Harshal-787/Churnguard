import sys
sys.path.append('.')
from backend.app.database import SessionLocal
from backend.app.models import User
from backend.app.routers.predict import reanalyze_all
from unittest.mock import MagicMock

db = SessionLocal()
user = db.query(User).filter(User.role == 'Super Admin').first()
req = MagicMock()
req.client.host = '127.0.0.1'

print("Running reanalyze...")
res = reanalyze_all(req, db, user)
print(res)
