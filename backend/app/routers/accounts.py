from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_database_session
from app.dependencies import get_current_user
from app.models import Account, Transaction, User
from app.schemas import AccountCreate, AccountOut

router = APIRouter(prefix="/accounts", tags=["Счета"])


def get_own_account(account_id: int, current_user: User, database_session: Session) -> Account:
    """Находит счёт и проверяет, что он принадлежит текущему пользователю."""
    account = (
        database_session.query(Account)
        .filter(Account.id == account_id, Account.user_id == current_user.id)
        .first()
    )
    if account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Счёт не найден")
    return account


@router.get("", response_model=list[AccountOut])
def get_accounts(
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    return database_session.query(Account).filter(Account.user_id == current_user.id).order_by(Account.id).all()


@router.post("", response_model=AccountOut, status_code=status.HTTP_201_CREATED)
def create_account(
    account_data: AccountCreate,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    new_account = Account(user_id=current_user.id, **account_data.model_dump())
    database_session.add(new_account)
    database_session.commit()
    database_session.refresh(new_account)
    return new_account


@router.put("/{account_id}", response_model=AccountOut)
def update_account(
    account_id: int,
    account_data: AccountCreate,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    account = get_own_account(account_id, current_user, database_session)
    account.name = account_data.name
    account.type = account_data.type
    account.balance = account_data.balance
    database_session.commit()
    database_session.refresh(account)
    return account


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    account = get_own_account(account_id, current_user, database_session)

    has_transactions = database_session.query(Transaction).filter(Transaction.account_id == account.id).first()
    if has_transactions is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нельзя удалить счёт: по нему есть транзакции")

    database_session.delete(account)
    database_session.commit()
