from models import Cart, CartItem, Product, Order, Status, UserTable, Role
from sqlmodel import select
from fastapi import HTTPException, APIRouter, Depends, Request
from dependencies import SessionDep
from libs.auth_jwt import get_current_user
from libs.lib_sender import send_email, generic_email

import datetime
# TODO: Replace with actual user email once users stop being fake and start getting real.

router = APIRouter(
    prefix="/order",
    tags=["order"],
)


@router.get("/")
async def get_your_orders(session: SessionDep, current_user=Depends(get_current_user)):
    """
    Get all orders for the currently authenticated user.
    """
    orders = session.exec(
        select(Order).where(Order.user_id == current_user.get("user_id"))
    ).all()
    return orders


@router.get("/all")
async def get_all_orders(session: SessionDep, current_user=Depends(get_current_user)):
    """
    Get all orders in the system — ADMIN ONLY.
    """
    user_role = session.exec(
        select(UserTable.role).where(UserTable.id == current_user.get("user_id"))
    ).first()

    if user_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")

    return session.exec(select(Order)).all()


@router.post("/change_state/{order_id}")
async def change_order_state(
    order_id: int,
    request: Request,
    session: SessionDep,
    current_user=Depends(get_current_user)
):
    """
    ADMIN ONLY — Change the status of an order.
    """
    payload = await request.json()
    new_state = payload.get("state")

    if new_state is None:
        raise HTTPException(status_code=400, detail="Missing state")

    user_role = session.exec(
        select(UserTable.role).where(UserTable.id == current_user.get("user_id"))
    ).first()

    if user_role != Role.ADMIN:
        raise HTTPException(status_code=403, detail="Unauthorized")

    order = session.exec(select(Order).where(Order.id == order_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    try:
        order.status = list(Status)[new_state].value
    except IndexError:
        raise HTTPException(status_code=400, detail="Invalid state index")

    session.add(order)
    session.commit()

    username = session.exec(
        select(UserTable.username).where(UserTable.id == current_user.get("user_id"))
    ).first()

    html_message = generic_email(
        {
            "order_id": order_id,
            "order_status": order.status,
            "customer_name": username,
            "year": datetime.datetime.now().year,
        },
        "order.html",
    )

    # Send the email using your new refactored email sender
    send_email(
        receiver="waitwut8@gmail.com",  # You can use the real customer's email here if available
        subject="Order state changed",
        message=html_message,
    )

    return {"message": f"Order {order_id} status updated to {order.status}"}


@router.post("/spec/{order_id}")
async def get_specific_order(
    order_id: int,
    session: SessionDep,
    current_user=Depends(get_current_user)
):
    """
    Retrieve details of a specific order. ADMIN or owner only.
    """
    order = session.exec(select(Order).where(Order.id == order_id)).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.user_id != current_user.get("user_id"):
        user_role = session.exec(
            select(UserTable.role).where(UserTable.id == current_user.get("user_id"))
        ).first()
        if user_role != Role.ADMIN:
            raise HTTPException(status_code=403, detail="Unauthorized")

    return order
