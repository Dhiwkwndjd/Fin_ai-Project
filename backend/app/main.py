import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models  # noqa: F401  (нужно, чтобы таблицы были зарегистрированы)
from app.database import Base, engine
from app.routers import admin, auth

load_dotenv()

# Создаём таблицы в БД, если их ещё нет
Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinAi API")

# CORS: разрешаем браузеру с адреса фронтенда обращаться к этому серверу
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(admin.router)


@app.get("/")
def read_root():
    return {"message": "FinAi API работает. Документация: /docs"}
