from sqlalchemy import create_engine, event
from sqlalchemy.orm import declarative_base, sessionmaker

DATABASE_URL = "sqlite:///./finai.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

@event.listens_for(engine, "connect")
def replace_lower_function(connection, connection_record):
    """Встроенная функция lower() в SQLite не понимает русские буквы.
    Подменяем её своей, чтобы поиск "прод" находил "Продукты"."""
    connection.create_function("lower", 1, lambda text: text.lower() if text else text)


def get_database_session():
    """Открывает сессию БД для одного запроса и закрывает её после ответа."""
    database_session = SessionLocal()
    try:
        yield database_session
    finally:
        database_session.close()
