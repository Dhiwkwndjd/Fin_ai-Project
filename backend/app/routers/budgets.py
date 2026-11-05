from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_database_session
from app.dependencies import get_current_user
from app.models import Budget, Category, Transaction, User
from app.schemas import BudgetCreate, BudgetOut, CategoryOut

router = APIRouter(prefix="/budgets", tags=["Бюджеты"])


def build_budget_out(budget: Budget, database_session: Session) -> BudgetOut:
    """Считает, сколько потрачено по категории за месяц бюджета."""
    spent = (
        database_session.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.user_id == budget.user_id,
            Transaction.category_id == budget.category_id,
            Transaction.kind == "expense",
            func.strftime("%Y-%m", Transaction.date) == budget.month,
        )
        .scalar()
    )
    return BudgetOut(
        id=budget.id,
        month=budget.month,
        limit_amount=budget.limit_amount,
        spent=spent,
        category=CategoryOut.model_validate(budget.category),
    )


def check_budget_data(budget_data: BudgetCreate, current_user: User, database_session: Session, budget_id: int = 0):
    category = database_session.get(Category, budget_data.category_id)
    category_is_available = category is not None and (category.user_id is None or category.user_id == current_user.id)
    if not category_is_available:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Категория не найдена")
    if category.kind != "expense":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Бюджет можно создать только для категории расходов")

    same_budget = (
        database_session.query(Budget)
        .filter(
            Budget.user_id == current_user.id,
            Budget.category_id == budget_data.category_id,
            Budget.month == budget_data.month,
            Budget.id != budget_id,
        )
        .first()
    )
    if same_budget is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Бюджет на эту категорию и месяц уже есть")


def get_own_budget(budget_id: int, current_user: User, database_session: Session) -> Budget:
    budget = (
        database_session.query(Budget)
        .filter(Budget.id == budget_id, Budget.user_id == current_user.id)
        .first()
    )
    if budget is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Бюджет не найден")
    return budget


@router.get("", response_model=list[BudgetOut])
def get_budgets(
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    budgets = (
        database_session.query(Budget)
        .filter(Budget.user_id == current_user.id)
        .order_by(Budget.month.desc(), Budget.id)
        .all()
    )
    return [build_budget_out(budget, database_session) for budget in budgets]


@router.post("", response_model=BudgetOut, status_code=status.HTTP_201_CREATED)
def create_budget(
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    check_budget_data(budget_data, current_user, database_session)
    new_budget = Budget(user_id=current_user.id, **budget_data.model_dump())
    database_session.add(new_budget)
    database_session.commit()
    database_session.refresh(new_budget)
    return build_budget_out(new_budget, database_session)


@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(
    budget_id: int,
    budget_data: BudgetCreate,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    budget = get_own_budget(budget_id, current_user, database_session)
    check_budget_data(budget_data, current_user, database_session, budget_id=budget.id)
    budget.category_id = budget_data.category_id
    budget.month = budget_data.month
    budget.limit_amount = budget_data.limit_amount
    database_session.commit()
    database_session.refresh(budget)
    return build_budget_out(budget, database_session)


@router.delete("/{budget_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_budget(
    budget_id: int,
    current_user: User = Depends(get_current_user),
    database_session: Session = Depends(get_database_session),
):
    budget = get_own_budget(budget_id, current_user, database_session)
    database_session.delete(budget)
    database_session.commit()
