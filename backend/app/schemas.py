from datetime import date

from pydantic import BaseModel, ConfigDict, Field


# ---------- Авторизация ----------
class UserRegister(BaseModel):
    full_name: str = Field(min_length=2)
    email: str = Field(min_length=3)
    password: str = Field(min_length=6)


class UserLogin(BaseModel):
    email: str
    password: str


class UserOut(BaseModel):
    # from_attributes позволяет создавать схему прямо из объекта SQLAlchemy
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: str
    role: str


class TokenPair(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


# ---------- Счета ----------
class AccountCreate(BaseModel):
    name: str = Field(min_length=1)
    type: str = Field(pattern="^(card|cash)$")
    balance: int = 0


class AccountOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    type: str
    balance: int


# ---------- Категории ----------
class CategoryCreate(BaseModel):
    name: str = Field(min_length=1)
    kind: str = Field(pattern="^(income|expense)$")


class CategoryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    kind: str
    user_id: int | None = None


# ---------- Транзакции ----------
class TransactionCreate(BaseModel):
    account_id: int
    category_id: int
    amount: int = Field(gt=0)
    kind: str = Field(pattern="^(income|expense)$")
    description: str = ""
    date: date


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    amount: int
    kind: str
    description: str
    date: date
    account: AccountOut
    category: CategoryOut


class TransactionPage(BaseModel):
    """Одна страница списка транзакций + общее количество для пагинации."""

    items: list[TransactionOut]
    total: int
    page: int
    page_size: int


# ---------- Бюджеты ----------
class BudgetCreate(BaseModel):
    category_id: int
    month: str = Field(pattern=r"^\d{4}-\d{2}$")  # например "2026-11"
    limit_amount: int = Field(gt=0)


class BudgetOut(BaseModel):
    id: int
    month: str
    limit_amount: int
    spent: int  # сколько уже потрачено в этом месяце
    category: CategoryOut
