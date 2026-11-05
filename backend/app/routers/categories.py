from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_database_session
from app.dependencies import get_current_user
from app.models import Budget, Category, Transaction, User
from app.schemas import CategoryCreate, CategoryOut

router = APIRouter(prefix="/categories", tags=["Категории"])


def check_category_not_used(category: Category, database_session: Session):
    """Нельзя удалять категорию, которая уже используется."""
    used_in_transaction = database_session.query(Transaction).filter(Transaction.category_id == category.id).first()
    used_in_budget = database_session.query(Budget).filter(Budget.category_id == category.id).first()
    if used_in_transaction is not None or used_in_budget is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Нельзя удалить категорию: она уже используется")


@router.get("", response_model=list[CategoryOut])
def get_categories(
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    # Общие категории (user_id пустой) + собственные категории пользователя
    all_categories = database_session.query(Category).order_by(Category.id).all()
    return [
        category
        for category in all_categories
        if category.user_id is None or category.user_id == current_user.id
    ]


@router.post("", response_model=CategoryOut, status_code=status.HTTP_201_CREATED)
def create_category(
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    new_category = Category(user_id=current_user.id, name=category_data.name.strip(), kind=category_data.kind)
    database_session.add(new_category)
    database_session.commit()
    database_session.refresh(new_category)
    return new_category


def get_own_category(category_id: int, current_user: User, database_session: Session) -> Category:
    category = (
        database_session.query(Category)
        .filter(Category.id == category_id, Category.user_id == current_user.id)
        .first()
    )
    if category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Категория не найдена (общие категории может менять только админ)")
    return category


@router.put("/{category_id}", response_model=CategoryOut)
def update_category(
    category_id: int,
    category_data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    category = get_own_category(category_id, current_user, database_session)
    category.name = category_data.name.strip()
    category.kind = category_data.kind
    database_session.commit()
    database_session.refresh(category)
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    category = get_own_category(category_id, current_user, database_session)
    check_category_not_used(category, database_session)
    database_session.delete(category)
    database_session.commit()
