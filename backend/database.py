import os
from pathlib import Path
from sqlmodel import create_engine, SQLModel, Session, text

BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "app.db"
DATABASE_URL = f"sqlite:///{DB_FILE}"

connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

def migrate_existing_tables():
    """Safely add new columns to existing SQLite tables if not present."""
    with engine.connect() as conn:
        # Check user_profile columns
        user_cols = [
            ("xp", "INTEGER DEFAULT 0"),
            ("level", "INTEGER DEFAULT 1"),
            ("badges_json", "TEXT DEFAULT '[]'"),
            ("email", "TEXT DEFAULT ''"),
        ]
        for col_name, col_type in user_cols:
            try:
                conn.execute(text(f"ALTER TABLE user_profile ADD COLUMN {col_name} {col_type}"))
                conn.commit()
            except Exception:
                pass

        # Check planner_task columns
        task_cols = [
            ("subject", "TEXT DEFAULT 'General'"),
        ]
        for col_name, col_type in task_cols:
            try:
                conn.execute(text(f"ALTER TABLE planner_task ADD COLUMN {col_name} {col_type}"))
                conn.commit()
            except Exception:
                pass

        # Check skill_node columns
        node_cols = [
            ("is_completed", "BOOLEAN DEFAULT 0"),
        ]
        for col_name, col_type in node_cols:
            try:
                conn.execute(text(f"ALTER TABLE skill_node ADD COLUMN {col_name} {col_type}"))
                conn.commit()
            except Exception:
                pass

def init_db():
    SQLModel.metadata.create_all(engine)
    migrate_existing_tables()

def get_session():
    with Session(engine) as session:
        yield session
