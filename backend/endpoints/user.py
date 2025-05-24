from models import UserTable

from sqlmodel import select
from fastapi import HTTPException, APIRouter, Depends, Request, Response
from dependencies import SessionDep
from libs.schemas import LoginInfo
from libs.auth_jwt import sign_jwt, JWTBearer, decode_jwt, get_current_user
from models import Role, LoginPayload
from utils import hash_password, verify_password, generate_code_from_string
from copy import deepcopy

from libs.lib_sender import *

router = APIRouter(
    prefix="/user",
    tags=["user"],
    responses={404: {"description": "Not found"}},
)

@router.get("/check_role", dependencies=[Depends(JWTBearer())])
async def check_role(session: SessionDep, current_user=Depends(get_current_user)):
    user_id = current_user.get("user_id")
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"role": user.role}
@router.get("/whoami", dependencies=[Depends(JWTBearer())])
async def whoami(session: SessionDep, current_user=Depends(get_current_user)):

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
        raise HTTPException(status_code=403, detail="Unauthorized")
    return session.exec(select(UserTable)).all()


@router.post("/add")
async def add_user(user: UserTable, session: SessionDep):
    user.password = hash_password(user.password)
    user.role = Role.USER
    if not user.email:
        user.email = "example@example.com"
    if not user.phone:
        user.phone = "1234567890"
    if not user.image:
        user.image = "not available"

    try:

        session.add(user)
        session.commit()
        session.refresh(user)
        print(f"sending email for {user.first_name}")
        send_email(
            
            "waitwut8@gmail.com",
            "You have registered",
            generic_email(
                {
                    "first": user.first_name,
                    "username": user.username,
                },
                "registration.html",
            ),
        )
        print(f"sent email for {user.first_name}")
    except Exception as e:
        print(e)
        raise HTTPException(status_code=400, detail=f"User already exists: {e}") from e

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


@router.post("/delete", dependencies=[Depends(JWTBearer())])
async def delete_user(
    request: Request, session: SessionDep, current_user=Depends(get_current_user)
):

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
    if not user_info.active:
        raise HTTPException(status_code=403, detail="User is disabled")
    
    if verify_password(user.password, user_info.password):
        return user_info
    else:
        raise HTTPException(status_code=401, detail="Login failed")


@router.post("/login")
async def login_user(user: LoginInfo, session: SessionDep):

    if user := check_login(user, session):

        return sign_jwt(
            {"user_name": user.username, "user_id": user.id, "role": user.role}
        )
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

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.email = requested_user.email

    user.first_name = requested_user.first_name
    user.last_name = requested_user.last_name

    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post("/edit_user", dependencies=[Depends(JWTBearer())])
async def edit_user(
    request: Request,
    session: SessionDep,
    current_user=Depends(get_current_user),
):
    verify_user_role(session, current_user)
    request_data = await request.json()
    user_id = request_data.get("user_id")
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    requested_user = UserTable(**request_data.get("requested_user"))

    
    
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    user.username = requested_user.username or user.username
    user.email = requested_user.email or user.email
    user.first_name = requested_user.first_name or user.first_name
    user.last_name = requested_user.last_name or user.last_name
    user.role = requested_user.role or user.role

    session.add(user)
    session.commit()
    session.refresh(user)
    return user
@router.post("/disable", dependencies=[Depends(JWTBearer())])
async def disable(request: Request, session: SessionDep, current_user=Depends(get_current_user)):
    user_id = await request.json()
    user_id = user_id.get("user_id")
    verify_user_role(session, current_user)
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    user.active = not user.active
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

def verify_user_role(session, current_user):
    role = (
        session.exec(
            select(UserTable).where(UserTable.id == current_user.get("user_id"))
        ).first()
    ).role
    if role != Role.ADMIN:
        raise HTTPException(status_code=401, detail="Unauthorized")


@router.post("/get_role", dependencies=[Depends(JWTBearer())])
async def get_role(session: SessionDep, current_user=Depends(get_current_user)):

    user_id = current_user.get("user_id")
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    return user.role


@router.post("/change_profile_pic")
async def change_profile_pic(
    request: Request, session: SessionDep, current_user=Depends(get_current_user)
):
    url = (await request.json()).get("url")

    user_id = current_user.get("user_id")
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    user.image = url
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.get("/get_profile_pic", dependencies=[Depends(JWTBearer())])
async def get_profile_pic(session: SessionDep, current_user=Depends(get_current_user)):
    user_id = current_user.get("user_id")

    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    return user.image


@router.post("/change_password", dependencies=[Depends(JWTBearer())])
async def change_password(
    request: Request, session: SessionDep, current_user=Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()

    password = (await request.json()).get("password")

    user.password = hash_password(password)
    session.add(user)

    session.commit()
    session.refresh(user)
    send_email(
        "waitwut8@gmail.com",
        "Password Change",
        generic_email({"first": user.first_name}, "password_change.html"),
    )
    return user


@router.post("/promote", dependencies=[Depends(JWTBearer())])
async def promote_user(
    request: Request, session: SessionDep, current_user=Depends(get_current_user)
):
    verify_user_role(session, current_user)
    user_id = (await request.json()).get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="No user_id provided")
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    user.role = Role.ADMIN
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@router.post("/demote", dependencies=[Depends(JWTBearer())])
async def demote_user(
    request: Request, session: SessionDep, current_user=Depends(get_current_user)
):
    verify_user_role(session, current_user)
    user_id = (await request.json()).get("user_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="No user_id provided")
    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    user.role = Role.USER
    session.add(user)
    session.commit()
    session.refresh(user)


@router.post("/whothis")
async def whothis(session: SessionDep, request: Request):
    user_id = await request.json()
    user_id = user_id.get("user_id")

    user = session.exec(select(UserTable).where(UserTable.id == user_id)).first()
    return user.username if user else "user does not exist"


@router.post("/is_token_active", dependencies=[Depends(JWTBearer())])
async def is_token_active(current_user=Depends(get_current_user)):
    return {"active": True} if current_user else {"active": False}

@router.post("/reset_password")
async def reset_password(request: Request, session: SessionDep):
    data = await request.json()
    code = data.get("code")
    username = data.get("username")
    new_password = data.get("password")
    print(data)
    if not code or not username or not new_password:
        raise HTTPException(status_code=400, detail="Missing required fields")
    user = session.exec(select(UserTable).where(UserTable.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if  generate_code_from_string(user.username) != code:
        raise HTTPException(status_code=400, detail="Invalid code")
    user.password = hash_password(new_password)
    session.add(user)
    session.commit()
    session.refresh(user)

@router.post("/send_reset_code")
async def send_reset_code(request: Request, session: SessionDep):
    data = await request.json()
    username = data.get("username")
    if not username:
        raise HTTPException(status_code=400, detail="Missing required fields")
    user = session.exec(select(UserTable).where(UserTable.username == username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    code = generate_code_from_string(user.username)
    send_email(
        receiver="waitwut8@gmail.com",
        subject="Password Reset Code",
        message=generic_email(
            {
                "first": user.first_name,
                "username": user.username,
                "code": code,
            },
            "password_reset.html",
        ),
    )

