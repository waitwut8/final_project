from models import UserTable

from sqlmodel import select
from fastapi import HTTPException, APIRouter, Depends, Request, Response
from dependencies import SessionDep
from libs.schemas import LoginInfo
from libs.auth_jwt import sign_jwt, JWTBearer, decode_jwt, get_current_user
from models import Role
from utils import hash_password, verify_password

from libs.lib_sender import *

router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)


@router.get("/whoami", dependencies=[Depends(JWTBearer())])
async def whoami(session: SessionDep, current_user=Depends(get_current_user)):
    print(f"current_user: {current_user}")
    user_info = session.exec(
        select(UserTable).where(UserTable.id == current_user.get("user_id"))
    ).first()
    return {
        "user_id": user_info.id,
        "username": user_info.username,
        "email": user_info.email,
        "first_name": user_info.first_name,
        "last_name": user_info.last_name,
        "role": user_info.role,
    }


@router.get("/", dependencies=[Depends(JWTBearer())])
async def read_all_user(session: SessionDep, current_user=Depends(get_current_user)):
    role = (
        session.exec(
            select(UserTable).where(UserTable.id == current_user.get("user_id"))
        ).first()
    ).role
    if not role in [Role.STAFF, Role.ADMIN]:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return session.exec(select(UserTable)).all()


@router.get("/{user_id}")
async def read_spec_user(user_id: str, session: SessionDep):
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/add")
async def add_user(user: UserTable, session: SessionDep):
    user.password = hash_password(user.password)
    try:
        print(user)
        session.add(user)
        session.commit()
        session.refresh(user)
        send_email(
            "waitwut8@gmail.com",
            "waitwut8@gmail.com",
            "You have registered",
            generic_email(
                {
                    "first": user.first_name,
                    "user": user.username,
                },
                "registration.html",
            ),
        )
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail="User already exists")

    return user


@router.post("/refresh", dependencies=[Depends(JWTBearer())])
async def refresh_token(current_user=Depends(get_current_user)):
    return sign_jwt(current_user.get("user_name"), current_user.get("user_id"))


@router.put("/update/{user_id}")
async def update_user(user_id: int, user: UserTable, session: SessionDep):
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


@router.delete("/delete", dependencies=[Depends(JWTBearer())])
async def delete_user(
    request: Request, session: SessionDep, current_user=Depends(get_current_user)
):
    print(await request.json())
    user_id = await request.json()
    user_id = user_id.get("user_id")
    role = (
        session.exec(
            select(UserTable).where(UserTable.id == current_user.get("user_id"))
        )
        .first()
        .role
    )
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if role != Role.ADMIN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    session.delete(user)
    session.commit()
    return user


def check_login(user: LoginInfo, session: SessionDep) -> object:

    user_info = session.exec(
        select(UserTable).where(UserTable.username == user.username)
    ).first()
    if user_info is None:
        raise HTTPException(status_code=404, detail="User not found")

    if verify_password(user.password, user_info.password):
        return user_info
    else:
        raise HTTPException(status_code=401, detail="Login failed")


@router.post("/login")
async def login_user(user: LoginInfo, session: SessionDep):

    if user := check_login(user, session):
        print(f"User {user.username} logged in")
        return sign_jwt(user.username, user.id)
    else:
        raise HTTPException(status_code=401, detail="Login failed")


@router.post("/edit_profile", dependencies=[Depends(JWTBearer())])
async def edit_profile(
    requested_user: UserTable,
    session: SessionDep,
    current_user=Depends(get_current_user),
):
    user_id = current_user.get("user_id")
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    # session.delete(user)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    # user.username =requested_user.username
    user.email = requested_user.email
    # user.password =requested_user.password
    user.first_name = requested_user.first_name
    user.last_name = requested_user.last_name
    # user.role =requested_user.role
    # print(user)
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/disable", dependencies=[Depends(JWTBearer())])
async def disable(request: Request, session: SessionDep):
    user_id = await request.json()
    user_id = user_id.get("user_id")

    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.active = False
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/get_role", dependencies=[Depends(JWTBearer())])
async def get_role(session: SessionDep, current_user=Depends(get_current_user)):
    print(current_user)
    # return sign_jwt(current_user.get("user_name"), current_user.get("user_id"))
    user_id = current_user.get("user_id")
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    return user.role
