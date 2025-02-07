from sqlmodel import Field, SQLModel, create_engine, Column, JSON
from sqlalchemy import UniqueConstraint
from enum import Enum
from typing import Optional
from pydantic import BaseModel



class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"
    STAFF = "staff"
    GUEST = "guest"
# class UserTable(SQLModel, table=True):
#     __table_args__ = (UniqueConstraint('username', name = "abc"),)
#     id: Optional[int] = Field(default=None, primary_key=True)
#     username: str
#     email: str
#     password: str
#     first_name: str
#     last_name: str
#     role: Role
#     phone: str
#     active: bool

class UserTable(SQLModel, table=True):
    __table_args__ = (UniqueConstraint('username'),)
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str
    last_name: str
    email: str
    phone: str
    username: str
    password: str
    image: str
    role: Role
    active: Optional[bool] = 'true'


class Product(SQLModel, table=True):
    product_id: Optional[str] = Field(default=None, primary_key=True)
    title: str
    description: str
    price: float
    stock: int
    tags: list[str] = Field(sa_column=Column(JSON))
    brand: str
    images: list[str] = Field(sa_column=Column(JSON))
    thumbnail: str

class LoginPayload(BaseModel):
    user_name: str
    user_id: str
    role: Role
