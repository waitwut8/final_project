from enum import Enum
from typing import Optional, List
from sqlmodel import Field, SQLModel, Column, JSON
from sqlalchemy import UniqueConstraint
from pydantic import BaseModel, computed_field
from sqlalchemy_json import mutable_json_type
import datetime



class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"
    STAFF = "staff"
    GUEST = "guest"
    moderator = ADMIN


class UserTable(SQLModel, table=True):
    __table_args__ = (UniqueConstraint('username', name='uq_username'),)
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str
    last_name: str
    email: str
    phone: str
    username: str
    password: str
    image: str
    role: Role
    active: Optional[bool] = True
class FakeUserTable(SQLModel, table=True):
    __table_args__ = (UniqueConstraint('username', name='uq_username'),)
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str
    last_name: str
    email: str
    phone: str
    username: str
    password: str
    image: str
    role: Role
    active: Optional[bool] = True


class Product(SQLModel, table=True):
    # id: Optional[int] = Field(default = None, primary_key=True)
    product_id: Optional[int] = Field(default = None, primary_key=True)
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
class CartItem(BaseModel):
    id: Optional[int] = None
    
    quantity: Optional[int] = 0  # Default is 0 if not provided

    @computed_field
    @property
    def total(self) -> float:
        # Handle None values safely; if any field is None, return 0 as fallback
        return (self.price or 0) * (self.quantity or 0)

    @computed_field
    @property
    def discounted_price(self) -> float:
        # Same here, if price or discount is None, return 0
        return (self.price or 0) * (1 - ((self.discount_percentage or 0) / 100))

    @computed_field
    @property
    def discounted_total(self) -> float:
        # Finally, if discounted price or quantity is None, fallback to 0
        return (self.discounted_price or 0) * (self.quantity or 0)

    
class Cart(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    items: List[str] = Field(sa_column=Column(JSON))
    total: float
    discounted_total: float

class Status(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
class Order(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    items: List[str] = Field(sa_column=Column(JSON))
    total: float
    status: str
    created_at: Optional[str] = datetime.datetime.now()
    updated_at: Optional[str]  = datetime.datetime.now()

class Review(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    product_id: int
    rating: int
    review: str
    created_at: Optional[str] = datetime.datetime.now()
    updated_at: Optional[str]  = datetime.datetime.now()

class Post(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int
    title: str
    content: str
    likes: int
    dislikes: int
    views: int
    created_at: Optional[str]
