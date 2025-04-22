from models import Cart, CartItem, Product
from sqlmodel import select
from fastapi import HTTPException, APIRouter, Depends
from dependencies import SessionDep
from libs.auth_jwt import get_current_user
from endpoints.lib_analytics import top_products, rev_over_time, plot_orders_over_time, prod_over_time, generate_order

import random
router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    responses={404: {"description": "Not found"}},
)

@router.get("/get_top_products")
async def get_top_products(session: SessionDep):
    return top_products(session)

@router.get("/get_revenue_over_time")
async def get_revenue_over_time(session: SessionDep):
    return rev_over_time(session)

@router.get("/get_orders_over_time")
async def get_plot_orders_over_time(session: SessionDep):
    return plot_orders_over_time(session)

@router.get("/get_products_over_time")
async def get_prod_over_time(session: SessionDep):
    return prod_over_time(session)



