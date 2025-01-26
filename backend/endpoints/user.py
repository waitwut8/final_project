
from ..database import UserTable

from sqlmodel import  select
from fastapi import HTTPException, APIRouter
from ..dependencies import SessionDep
from ..libs.schemas import LoginInfo
from ..libs.auth_jwt import sign_jwt
router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)

@router.get("/")
def read_all_user(session: SessionDep):
    return session.exec(select(UserTable)).all()

@router.get("/{user_id}")
def read_spec_user(user_id: int, session: SessionDep):
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/add")
def add_user(user: UserTable, session: SessionDep):
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.put("/update/{user_id}")
def update_user(user_id: int, user: UserTable, session: SessionDep):
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.username = user.username
    user.email = user.email
    user.password = user.password
    user.first_name = user.first_name
    user.last_name = user.last_name
    user.role = user.role
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.delete("/delete/{user_id}")
def delete_user(user_id: int, session: SessionDep):
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    session.delete(user)
    session.commit()
    return user

def check_login(user: LoginInfo, session: SessionDep) -> object:
    user = session.exec(select(UserTable).where(UserTable.username == user.username).where(UserTable.password == user.password)).first()
    if user != None:
        return user
    return {}

@router.post("/login")
def login_user(user: LoginInfo, session: SessionDep):

    if (user := check_login(user, session)):
        print (f"User {user.username} logged in")
        return sign_jwt(user.username, user.id)
    else:
        raise HTTPException(status_code=401, detail="Login failed")