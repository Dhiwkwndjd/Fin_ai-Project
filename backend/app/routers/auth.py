from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_database_session
from app.dependencies import get_current_user
from app.models import User
from app.schemas import RefreshRequest, TokenPair, UserLogin, UserOut, UserRegister
from app.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)

router = APIRouter(prefix="/auth", tags=["Авторизация"])


def build_token_pair(user_id: int) -> TokenPair:
    return TokenPair(
        access_token=create_access_token(user_id),
        refresh_token=create_refresh_token(user_id),
    )


@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def register(user_data: UserRegister, database_session: Session = Depends(get_database_session)):
    email = user_data.email.lower().strip()

    existing_user = database_session.query(User).filter(User.email == email).first()
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Пользователь с таким email уже есть")

    new_user = User(
        full_name=user_data.full_name.strip(),
        email=email,
        hashed_password=hash_password(user_data.password),
        role="user",  # через регистрацию можно стать только обычным пользователем
    )
    database_session.add(new_user)
    database_session.commit()
    database_session.refresh(new_user)
    return new_user


@router.post("/login", response_model=TokenPair)
def login(login_data: UserLogin, database_session: Session = Depends(get_database_session)):
    email = login_data.email.lower().strip()

    user = database_session.query(User).filter(User.email == email).first()
    if user is None or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Неверный email или пароль")

    return build_token_pair(user.id)


@router.post("/refresh", response_model=TokenPair)
def refresh(refresh_data: RefreshRequest, database_session: Session = Depends(get_database_session)):
    """Меняет refresh токен на новую пару токенов."""
    user_id = decode_token(refresh_data.refresh_token, "refresh")
    if user_id is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh токен недействителен или просрочен")

    user = database_session.get(User, user_id)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Пользователь не найден")

    return build_token_pair(user.id)


@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
