from models import Product

from sqlmodel import select, or_
from fastapi import HTTPException, APIRouter, Depends, Request, Response
from dependencies import SessionDep

# from libs.schemas import LoginInfo
from libs.auth_jwt import get_current_user, JWTBearer
from models import Role, UserTable
import random
from fnc.sequences import flattendeep

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

@router.get("/random")
def get_random_products(session: SessionDep):
    products = session.exec(select(Product)).all()
    random_products = random.sample(products, min(len(products), 6))
    return random_products


@router.get("/search/{keyword}")
def get_spec_products(keyword: str, session: SessionDep):
    result = session.exec(
        select(Product).where(
            or_(
                Product.title.regexp_match(keyword, "i"),
                Product.description.regexp_match(keyword, "i"),
                Product.tags.regexp_match(keyword, "i"),
                Product.brand.regexp_match(keyword, "i"),
                Product.product_id == keyword,
            )
        )
    ).all()
    return result


@router.get("/searchid/{product_id}")
def get_product_by_id(product_id: str, session: SessionDep):
    return session.exec(select(Product).where(Product.product_id == product_id)).first()

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
    print(product)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product


@router.post("/update", dependencies=[Depends(JWTBearer)])
def update_product(
    product: Product,

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
    product_id = product.product_id
    print(product)
    print(product_id)
    old_product = session.exec(
        select(Product).where(Product.product_id == product_id)
    ).first()
    if old_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    old_product.title = product.title if product.title else old_product.title
    old_product.description = product.description if product.description else old_product.description
    old_product.price = product.price.replace('$', "") if product.price else old_product.price
    old_product.stock = product.stock if product.stock else old_product.stock
    old_product.tags = product.tags if product.tags else old_product.tags
    old_product.brand = product.brand if product.brand else old_product.brand
    old_product.images = product.images if product.images else old_product.images
    old_product.thumbnail = product.thumbnail if product.thumbnail else old_product.thumbnail
    print(old_product)

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
@router.post("/update-thumbnail/{product_id}", dependencies=[Depends(JWTBearer)])
def update_product_thumbnail(
    product_id: str,
    thumbnail: str,
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

    product.thumbnail = thumbnail

    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.get("/next-id")
async def get_next_id(session: SessionDep):
    """
    Retrieve the next product ID.
    This function queries the database for the product
    with the highest ID
    and returns the next available product ID.
    Args:
        session (SessionDep): The database session dependency.
    Returns:
        dict: A dictionary containing the next product ID.
    
    """
    last_product = session.exec(select(Product.product_id).order_by(Product.product_id.desc())).all()
    print(last_product)
    last_product = max(last_product) if last_product else None
    print(last_product)
    
    if last_product is None:
        return {"product_id": 1}
    return {"product_id": int(last_product) + 1}

@router.get("/filters")
async def get_filters(session: SessionDep):
    """
    Retrieve the filters for the products.
    This function queries the database for the distinct
    values of the brand and tags columns in the products table.
    Args:
        session (SessionDep): The database session dependency.
    Returns:
        dict: A dictionary containing the filters for the products.
    
    """
    brands = session.exec(select(Product.brand).distinct()).all()
    tags = set(flattendeep(session.exec(select(Product.tags).distinct()).all()))
    return {"brands": brands, "tags": tags}

