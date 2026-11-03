"""Наполняет базу тестовыми данными. Запуск: python seed.py
Скрипт можно запускать повторно - он сначала очищает все таблицы."""
import random
from datetime import date, timedelta

from app import models  # noqa: F401
from app.database import Base, SessionLocal, engine
from app.models import Account, Budget, Category, Transaction, User
from app.security import hash_password

random.seed(1)  # чтобы данные каждый раз получались одинаковыми

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

database_session = SessionLocal()

# ---------- Пользователи ----------
admin_user = User(full_name="Админ FinAi", email="admin@finai.kz", hashed_password=hash_password("admin123"), role="admin")
regular_user = User(full_name="Данил Тестов", email="user@finai.kz", hashed_password=hash_password("user123"), role="user")
database_session.add_all([admin_user, regular_user])
database_session.commit()

# ---------- Общие категории (user_id пустой) ----------
expense_names = ["Продукты", "Транспорт", "Кафе и рестораны", "Жильё", "Развлечения", "Здоровье"]
income_names = ["Зарплата", "Подработка"]

expense_categories = [Category(name=name, kind="expense") for name in expense_names]
income_categories = [Category(name=name, kind="income") for name in income_names]
database_session.add_all(expense_categories + income_categories)
database_session.commit()

# ---------- Счета пользователя ----------
card_account = Account(user_id=regular_user.id, name="Kaspi Gold", type="card", balance=320000)
cash_account = Account(user_id=regular_user.id, name="Наличные", type="cash", balance=45000)
database_session.add_all([card_account, cash_account])
database_session.commit()

# ---------- Транзакции: 45 штук за последние 90 дней ----------
today = date.today()
transactions = []

for index in range(35):
    category = random.choice(expense_categories)
    account = random.choice([card_account, cash_account])
    transactions.append(
        Transaction(
            user_id=regular_user.id,
            account_id=account.id,
            category_id=category.id,
            amount=random.randint(8, 150) * 100,
            kind="expense",
            description=f"Расход: {category.name}",
            date=today - timedelta(days=random.randint(0, 89)),
        )
    )

for index in range(10):
    category = random.choice(income_categories)
    transactions.append(
        Transaction(
            user_id=regular_user.id,
            account_id=card_account.id,
            category_id=category.id,
            amount=random.randint(50, 400) * 1000,
            kind="income",
            description=f"Доход: {category.name}",
            date=today - timedelta(days=random.randint(0, 89)),
        )
    )

database_session.add_all(transactions)

# ---------- Бюджеты на текущий месяц ----------
current_month = today.strftime("%Y-%m")
budgets = [
    Budget(user_id=regular_user.id, category_id=expense_categories[0].id, month=current_month, limit_amount=80000),
    Budget(user_id=regular_user.id, category_id=expense_categories[1].id, month=current_month, limit_amount=30000),
    Budget(user_id=regular_user.id, category_id=expense_categories[2].id, month=current_month, limit_amount=40000),
]
database_session.add_all(budgets)

database_session.commit()
database_session.close()

print("Готово! Создано: 2 пользователя, 8 категорий, 2 счёта, 45 транзакций, 3 бюджета")
print("Админ:  admin@finai.kz / admin123")
print("Юзер:   user@finai.kz / user123")
