"""
alembic/env.py — Alembic Configuration

WHAT THIS FILE DOES:
This is the brain of Alembic. It tells Alembic:
  1. How to connect to your database (via DATABASE_URL from .env)
  2. Which models to look at when detecting changes (your SQLAlchemy Base)

SYSTEM DESIGN CONCEPT — Autogenerate:
When you run `alembic revision --autogenerate`, Alembic:
  1. Connects to your real database and reads its current structure
  2. Looks at your SQLAlchemy models (via target_metadata)
  3. Compares the two and generates the SQL diff automatically

This is why importing all your models here is critical —
if a model isn't imported, Alembic won't know it exists.
"""

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys
from dotenv import load_dotenv

load_dotenv()

# Add project root to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import Base and ALL models so Alembic can see every table
from app.db.database import Base
from app.models import *  # noqa — critical, don't remove

# Alembic Config object — reads from alembic.ini
config = context.config

# Override sqlalchemy.url with our .env value
# This means we never hardcode DB credentials in alembic.ini
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

# Setup logging from alembic.ini config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# This is what Alembic compares against your real DB
# It must include metadata from ALL your models
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """
    Run migrations without a live DB connection.
    Useful for generating SQL scripts to review before applying.
    Run with: alembic upgrade head --sql
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations with a live DB connection.
    This is the normal mode — used when you run `alembic upgrade head`.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,  # Don't pool connections in migrations
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            # compare_type=True tells Alembic to detect column TYPE changes too
            # e.g. String → Text, Integer → BigInteger
            compare_type=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()