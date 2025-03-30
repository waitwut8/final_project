from models import Cart, CartItem, Product, Order, Status, UserTable, Role
from sqlmodel import select, func
from fastapi import HTTPException, APIRouter, Depends, Request
from dependencies import SessionDep
from libs.auth_jwt import get_current_user
from libs.lib_sender import send_email, generic_email
import copy
from libs.lib_sender import send_email, generic_email

import datetime

router = APIRouter(
    prefix="/order",
    tags=["order"],
)


@router.get("/")
async def get_your_orders(session: SessionDep, current_user=Depends(get_current_user)):
    orders = session.exec(
        select(Order).where(Order.user_id == current_user.get("user_id"))
    ).all()
    return orders


@router.get("/all")
async def get_all_orders(session: SessionDep):
    orders = session.exec(select(Order)).all()
    return orders


@router.post("/change_state/{order_id}")
async def change_order_state(
    request: Request, session: SessionDep, current_user=Depends(get_current_user)
):
    """
    Change the state of an order.
    """
    request = await request.json()
    order_id = request.get("order_id")
    state = request.get("state")
    user_role = session.exec(
        select(UserTable.role).where(UserTable.id == current_user.get("user_id"))
    ).first()
    if state is None:
        raise HTTPException(status_code=400, detail="Missing state")

    order = session.exec(select(Order).where(Order.id == order_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Ensure the user is the owner of the order or an admin
    
    if user_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Update the order status
    try:
        order.status = list(Status)[state].value
    except IndexError:
        raise HTTPException(status_code=400, detail="Invalid state")

    session.add(order)
    session.commit()

    # Send email notification
    username = (
        session.exec(
            select(UserTable.username).where(UserTable.id == current_user.get("user_id"))
        ).first()
    )
    send_email(
        "waitwut8@gmail.com",
        "waitwut8@gmail.com",
        "Order state changed",
        generic_email(
            {
                "order_id": order_id,
                "order_status": order.status,
                "customer_name": username,
                "year": datetime.datetime.now().year,
            },
            "order.html",
        ),
    )
    return {"message": "Order state changed successfully"}


@router.post("/spec/{order_id}")
async def get_specific_order(
    session: SessionDep, order_id: int, current_user=Depends(get_current_user)
):
    """
    Get details of a specific order.
    """
    order = session.exec(select(Order).where(Order.id == order_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Ensure the user is the owner of the order or an admin
    if order.user_id != current_user.get("user_id"):
        user_role = session.exec(
            select(UserTable.role).where(UserTable.id == current_user.get("user_id"))
        ).first()
        if user_role != "ADMIN":
            raise HTTPException(status_code=403, detail="Unauthorized")

    return order
