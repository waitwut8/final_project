from models import Product

from sqlmodel import select, or_
from fastapi import HTTPException, APIRouter, Depends, Request, Response
from dependencies import SessionDep

# from libs.schemas import LoginInfo
from libs.auth_jwt import get_current_user, JWTBearer
from models import Role, UserTable


from libs.lib_sender import *

router = APIRouter(
    prefix="/product",
    tags=["product"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
def get_products(session: SessionDep):
    products = session.exec(select(Product)).all()
    return products


@router.get("/search/{keyword}")
def get_spec_products(keyword: str, session: SessionDep):
    result = session.exec(
        select(Product).where(
            or_(
                Product.title.regexp_match(keyword, "i"),
                Product.description.regexp_match(keyword, "i"),
                Product.tags.regexp_match(keyword, "i"),
                Product.brand.regexp_match(keyword, "i"),
            )
        )
    ).all()
    return result


@router.post("/add", dependencies=[Depends(JWTBearer)])
def add_product(
    product: Product, session: SessionDep, current_user=Depends(get_current_user)
):
    role = (
        session.exec(
            select(UserTable).where(UserTable.id == current_user.get("user_id"))
        ).first()
    ).role
    if role != Role.ADMIN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.post("/update/{product_id}")
def update_product(
    product: Product,
    product_id: str,
    session: SessionDep,
    current_user=Depends(get_current_user),
):
    role = (
        session.exec(
            select(UserTable).where(UserTable.id == current_user.get("user_id"))
        ).first()
    ).role
    if role != Role.ADMIN:
        raise HTTPException(status_code=401, detail="Unauthorized")

    old_product = session.exec(
        select(Product).where(Product.product_id == product_id)
    ).first()
    if old_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    old_product.title = product.title
    old_product.description = product.description
    old_product.price = product.price

    old_product.tags = product.tags
    old_product.brand = product.brand
    old_product.images = product.images
    old_product.thumbnail = product.thumbnail

    session.add(old_product)
    session.commit()
    session.refresh(old_product)
    return old_product

@router.delete("/delete/{product_id}")
def delete_product(
    product_id: str,
    session: SessionDep,
    current_user=Depends(get_current_user),
):
    role = (
        session.exec(
            select(UserTable).where(UserTable.id == current_user.get("user_id"))
        ).first()
    ).role
    if role != Role.ADMIN:
        raise HTTPException(status_code=401, detail="Unauthorized")

    product = session.exec(
        select(Product).where(Product.product_id == product_id)
    ).first()
    if product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return product