import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()
db_url = os.getenv("DATABASE_URL")
engine = create_engine(db_url)

with engine.connect() as conn:
    try:
        res = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name = 'subtasks'"))
        columns = [row[0] for row in res.fetchall()]
        print(f"Columns in subtasks table: {columns}")
    except Exception as e:
        print(f"Error checking columns: {e}")
