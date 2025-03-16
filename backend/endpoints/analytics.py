from models import Cart, CartItem, Product
from sqlmodel import select
from fastapi import HTTPException, APIRouter, Depends
from dependencies import SessionDep
from libs.auth_jwt import get_current_user
from endpoints.lib_analytics import top_products, rev_over_time, plot_orders_over_time, prod_over_time, generate_order
from alive_progress import alive_bar
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

@router.get("/")
async def run_orders(session: SessionDep):
    with alive_bar(15) as bar:
        for _ in range(15):
            generate_order(random.choice([1,2,4]),session)
            bar()