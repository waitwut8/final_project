from models import Cart, CartItem, Product, Order, Status, UserTable
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
    orders = session.exec(select(Order).where(Order.user_id == current_user.get("user_id"))).all()
    return orders

@router.get("/all")
async def get_all_orders(session: SessionDep, current_user=Depends(get_current_user)):
    orders = session.exec(select(Order)).all()
    return orders


@router.post("/change_state/{order_id}")
async def change_order_state(request: Request, session: SessionDep, current_user=Depends(get_current_user)):
    request = await request.json()
    order_id = request.get('order_id')
    state = request.get('state')
    if (order_id is None) or (state is None):
        raise HTTPException(status_code=400, detail="Missing order_id or state")
    order = session.exec(select(Order).where(Order.id == order_id)).first()
    username = session.exec(select(UserTable).where(UserTable.id == current_user.get("user_id"))).first().username
    if not order:
        print('cant find order')
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = list(Status)[state].value
    session.add(order)
    session.commit()
    send_email("waitwut8@gmail.com", "waitwut8@gmail.com", "Order state changed", generic_email({"order_id": order_id, "order_status": order.status, "customer_name": username, 'year': 2025}, "order.html"))
    return {"message": "Order state changed"}