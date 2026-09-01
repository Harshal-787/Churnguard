from backend.app.database import engine
from sqlalchemy import text

def alter():
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE prediction_history ADD COLUMN llm_strategy JSON;"))
            conn.commit()
            print("Successfully added llm_strategy column.")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    alter()
