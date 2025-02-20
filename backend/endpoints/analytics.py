from models import Cart, CartItem, Product
from sqlmodel import select
from fastapi import HTTPException, APIRouter, Depends
from dependencies import SessionDep
from libs.auth_jwt import get_current_user

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
    responses={404: {"description": "Not found"}},
)