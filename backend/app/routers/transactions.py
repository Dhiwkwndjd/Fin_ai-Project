from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_database_session
from app.dependencies import get_current_user
from app.models import Account, Category, Transaction, User
from app.schemas import TransactionCreate, TransactionOut, TransactionPage

router = APIRouter(prefix="/transactions", tags=["Транзакции"])

# Варианты сортировки: что пришло в параметре sort -> как сортировать в БД
SORT_OPTIONS = {
    "date_desc": [Transaction.date.desc(), Transaction.id.desc()],
    "date_asc": [Transaction.date.asc(), Transaction.id.asc()],
    "amount_desc": [Transaction.amount.desc()],
    "amount_asc": [Transaction.amount.asc()],
}


def change_balance(account: Account, kind: str, amount: int, direction: int):
    """Меняет баланс счёта. direction=1 - применить транзакцию, direction=-1 - отменить её."""
    signed_amount = amount if kind == "income" else -amount
    account.balance = account.balance + signed_amount * direction


def check_account_and_category(transaction_data: TransactionCreate, current_user: User, database_session: Session) -> Account:
    """Проверяем, что счёт свой, категория доступна и её тип совпадает с типом транзакции."""
    account = (
        database_session.query(Account)
        .filter(Account.id == transaction_data.account_id, Account.user_id == current_user.id)
        .first()
    )
    if account is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Счёт не найден")

    category = database_session.get(Category, transaction_data.category_id)
    category_is_available = category is not None and (category.user_id is None or category.user_id == current_user.id)
    if not category_is_available:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Категория не найдена")

    if category.kind != transaction_data.kind:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Тип категории не совпадает с типом транзакции")

    return account


def get_own_transaction(transaction_id: int, current_user: User, database_session: Session) -> Transaction:
    transaction = (
        database_session.query(Transaction)
        .filter(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
        .first()
    )
    if transaction is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Транзакция не найдена")
    return transaction


@router.get("", response_model=TransactionPage)
def get_transactions(
    search: Optional[str] = None,
    kind: Optional[str] = None,
    category_id: Optional[int] = None,
    account_id: Optional[int] = None,
    sort: str = "date_desc",
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    # 1. Начинаем с транзакций текущего пользователя
    query = database_session.query(Transaction).filter(Transaction.user_id == current_user.id)

    # 2. Добавляем условия, только если параметр передан
    if search:
        query = query.filter(func.lower(Transaction.description).like(f"%{search.lower()}%"))
    if kind:
        query = query.filter(Transaction.kind == kind)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if account_id:
        query = query.filter(Transaction.account_id == account_id)

    # 3. Считаем общее количество (для пагинации) ДО того, как отрезали страницу
    total = query.count()

    # 4. Сортировка и пагинация: пропускаем (page-1)*page_size записей и берём page_size
    order_by = SORT_OPTIONS.get(sort, SORT_OPTIONS["date_desc"])
    items = query.order_by(*order_by).offset((page - 1) * page_size).limit(page_size).all()

    return TransactionPage(items=items, total=total, page=page, page_size=page_size)


@router.get("/{transaction_id}", response_model=TransactionOut)
def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    return get_own_transaction(transaction_id, current_user, database_session)


@router.post("", response_model=TransactionOut, status_code=status.HTTP_201_CREATED)
def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    account = check_account_and_category(transaction_data, current_user, database_session)

    new_transaction = Transaction(user_id=current_user.id, **transaction_data.model_dump())
    database_session.add(new_transaction)
    change_balance(account, transaction_data.kind, transaction_data.amount, 1)

    database_session.commit()
    database_session.refresh(new_transaction)
    return new_transaction


@router.put("/{transaction_id}", response_model=TransactionOut)
def update_transaction(
    transaction_id: int,
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    transaction = get_own_transaction(transaction_id, current_user, database_session)
    new_account = check_account_and_category(transaction_data, current_user, database_session)

    # Сначала отменяем старую транзакцию на старом счёте, потом применяем новую на новом
    old_account = database_session.get(Account, transaction.account_id)
    change_balance(old_account, transaction.kind, transaction.amount, -1)
    change_balance(new_account, transaction_data.kind, transaction_data.amount, 1)

    transaction.account_id = transaction_data.account_id
    transaction.category_id = transaction_data.category_id
    transaction.amount = transaction_data.amount
    transaction.kind = transaction_data.kind
    transaction.description = transaction_data.description
    transaction.date = transaction_data.date

    database_session.commit()
    database_session.refresh(transaction)
    return transaction


@router.delete("/{transaction_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    transaction = get_own_transaction(transaction_id, current_user, database_session)

    # При удалении возвращаем деньги на счёт
    account = database_session.get(Account, transaction.account_id)
    change_balance(account, transaction.kind, transaction.amount, -1)

    database_session.delete(transaction)
    database_session.commit()
