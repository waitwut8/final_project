from sqlmodel import Field, SQLModel, create_engine
from enum import Enum
from typing import Optional



class Role(str, Enum):
    ADMIN = "admin"
    USER = "user"
    STAFF = "staff"
    GUEST = "guest"
class UserTable(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: str
    password: str
    first_name: str
    last_name: str
    role: Role

