from sqlalchemy import Column, Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    # Две роли: "user" и "admin"
    role = Column(String, default="user", nullable=False)


class Account(Base):
    """Счёт пользователя: карта или наличные."""

    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # "card" или "cash"
    balance = Column(Integer, default=0)  # сумма в тенге


class Category(Base):
    """Категория. Если user_id пустой - это общая категория, её ведёт админ."""

    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    name = Column(String, nullable=False)
    kind = Column(String, nullable=False)  # "income" (доход) или "expense" (расход)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    amount = Column(Integer, nullable=False)  # в тенге
    kind = Column(String, nullable=False)  # "income" или "expense"
    description = Column(String, default="")
    date = Column(Date, nullable=False)

    # relationship позволяет написать transaction.category.name
    account = relationship("Account")
    category = relationship("Category")


class Budget(Base):
    """Бюджет на месяц для одной категории расходов."""

    __tablename__ = "budgets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    month = Column(String, nullable=False)  # формат "2026-10"
    limit_amount = Column(Integer, nullable=False)

    category = relationship("Category")
