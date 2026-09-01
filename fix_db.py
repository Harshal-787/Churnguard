import sys
sys.path.append('.')
from backend.app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    conn.execute(text('ALTER TABLE audit_logs ADD COLUMN organization_id INTEGER REFERENCES organizations(id);'))
    conn.commit()
