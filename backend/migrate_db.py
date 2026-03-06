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

# First confirm title is there (should be from last run)
run_sql("ALTER TABLE subtasks ADD COLUMN title VARCHAR;")
run_sql("ALTER TABLE subtasks ADD COLUMN completed_at TIMESTAMPTZ;")
