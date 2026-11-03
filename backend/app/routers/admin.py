from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_database_session
from app.dependencies import get_current_admin
from app.models import User
from app.schemas import UserOut

router = APIRouter(prefix="/admin", tags=["Админ"])


@router.get("/users", response_model=list[UserOut])
def get_all_users(
    admin_user: User = Depends(get_current_admin),
    database_session: Session = Depends(get_database_session),
):
    """Список всех пользователей. Доступен только админу (иначе 403)."""
    return database_session.query(User).all()
