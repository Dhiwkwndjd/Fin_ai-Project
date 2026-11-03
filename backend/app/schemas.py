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
