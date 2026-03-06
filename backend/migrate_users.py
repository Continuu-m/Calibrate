import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
engine = create_engine(db_url)

def run_sql(sql):
    with engine.connect() as conn:
        try:
            conn.execute(text(sql))
            conn.commit()
            print(f"Executed: {sql}")
        except Exception as e:
            print(f"Error executing {sql}: {e}")

# Add columns to users table
run_sql("ALTER TABLE users ADD COLUMN cached_capacity JSON;")
run_sql("ALTER TABLE users ADD COLUMN last_calendar_sync TIMESTAMPTZ;")
run_sql("ALTER TABLE users ADD COLUMN alert_pending BOOLEAN DEFAULT FALSE;")
