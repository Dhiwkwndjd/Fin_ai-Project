import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import models 
from app.database import Base, engine
from app.routers import accounts, admin, auth, budgets, categories, transactions

load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI(title="FinAi API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:5173")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(accounts.router)
app.include_router(categories.router)
app.include_router(transactions.router)
app.include_router(budgets.router)
app.include_router(admin.router)


@app.get("/")
def read_root():
    return {"message": "FinAi API работает. Документация: /docs"}
