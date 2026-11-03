from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# SQLite - это просто файл finai.db, ничего устанавливать не нужно
DATABASE_URL = "sqlite:///./finai.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

# От этого класса наследуются все модели (таблицы)
Base = declarative_base()


def get_database_session():
    """Открывает сессию БД для одного запроса и закрывает её после ответа."""
    database_session = SessionLocal()
    try:
        yield database_session
    finally:
        database_session.close()
