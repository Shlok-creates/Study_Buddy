import os
from pathlib import Path
from sqlmodel import create_engine, SQLModel, Session

BASE_DIR = Path(__file__).resolve().parent
DB_FILE = BASE_DIR / "app.db"
DATABASE_URL = f"sqlite:///{DB_FILE}"

connect_args = {"check_same_thread": False}
engine = create_engine(DATABASE_URL, echo=False, connect_args=connect_args)

def init_db():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

