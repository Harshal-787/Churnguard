from app.database import SessionLocal
from app.models import Customer
from sqlalchemy import text

db = SessionLocal()
# 0 -> low, 1 -> mid, 2 -> high, 3 -> ultra-high
db.execute(text("UPDATE customers SET salary_band = 'low' WHERE id % 4 = 0"))
db.execute(text("UPDATE customers SET salary_band = 'mid' WHERE id % 4 = 1"))
db.execute(text("UPDATE customers SET salary_band = 'high' WHERE id % 4 = 2"))
db.execute(text("UPDATE customers SET salary_band = 'ultra-high' WHERE id % 4 = 3"))
db.commit()
print("Salary bands patched successfully!")
