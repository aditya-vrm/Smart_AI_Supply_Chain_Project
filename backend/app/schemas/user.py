from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict

class UserBase(BaseModel):
    username: str
    email: str
    role: Optional[str] = "admin"

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    role: Optional[str] = "admin"

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    user_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

class TokenPayload(BaseModel):
    sub: Optional[str] = None
