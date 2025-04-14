from models import Product

from sqlmodel import select, or_
from fastapi import HTTPException, APIRouter, Depends, Request, Response
from dependencies import SessionDep
from libs.lib_recommend import recommend_similar_users, recommend_products_for_user as recommend_products_logic

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
    random_products = random.sample(products, min(len(products), 12))
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
    
    
    old_product = session.exec(
        select(Product).where(Product.product_id == product_id)
    ).first()
    if old_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    
    for field in ["title", "description", "price", "stock", "tags", "brand", "images", "thumbnail"]:
        if getattr(product, field):
            setattr(old_product, field, getattr(product, field).replace("$", "").replace("'", ""))
    

    session.add(old_product)
    session.commit()
    session.refresh(old_product)
    updated_product = session.exec(select(Product).where(Product.product_id == product_id)).first()
    if updated_product == old_product:
        raise HTTPException(status_code=400, detail="No changes detected in the product")
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
    
    last_product = max(last_product) if last_product else None
    
    
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

@router.get("/random_tags")
async def get_random_tags(session: SessionDep):
    """
    Retrieve a random selection of tags.
    This function queries the database for all distinct tags
    and returns a random subset of them.
    Args:
        session (SessionDep): The database session dependency.
    Returns:
        list: A list of randomly selected tags.
    """
    all_tags = set(flattendeep(session.exec(select(Product.tags).distinct()).all()))
    random_tags = random.sample(sorted(all_tags), min(len(all_tags), 10))
    return {"tags": random_tags}

@router.get("/random_product_tag/{tag}")
async def get_random_products_by_tag(tag: str, session: SessionDep):
    """
    Retrieve a random selection of products by a specific tag.
    Args:
        tag (str): The tag to filter products by.
        session (SessionDep): The database session dependency.
    Returns:
        list: A list of randomly selected products with the specified tag.
    """
    print(tag)
    products = session.exec(select(Product).where(Product.tags.contains(tag))).all()
    print(products)
    random_products = random.sample(products, min(len(products), 10))
    return random_products


@router.get("/recommend", dependencies=[Depends(JWTBearer)])
async def recommend_products_for_user(
    session: SessionDep, current_user=Depends(get_current_user)
):
    """
    Recommend products for a specific user based on their preferences and history.
    Args:
        user_id (str): The ID of the user to recommend products for.
        session (SessionDep): The database session dependency.
        current_user: The currently authenticated user.
    Returns:
        list: A list of recommended products for the user.
    """
    print(current_user, type(current_user))
    user_id = current_user["user_id"]

    # Get recommended product IDs based on user preferences
    recommended_product_ids = recommend_products_logic(user_id, session)
    print(recommended_product_ids)

    # Fetch the recommended products from the database
    recommended_products = session.exec(
        select(Product).where(Product.product_id.in_(recommended_product_ids))
    ).all()

    return recommended_products

@router.get("/recommend_random_brand", dependencies=[Depends(JWTBearer)])
async def recommend_products_by_random_brand(
    session: SessionDep, current_user=Depends(get_current_user), top_n: int = 8
):
    """
    Recommend the most relevant products for a random brand.
    If the recommended products are fewer than 8, add random products of the same brand to match the count.
    Args:
        session (SessionDep): The database session dependency.
        current_user: The currently authenticated user.
        top_n (int): The number of top products to recommend (default is 8).
    Returns:
        dict: A dictionary containing the random brand and the recommended products.
    """
    # Get all distinct brands
    all_brands = session.exec(select(Product.brand).distinct()).all()
    if not all_brands:
        raise HTTPException(status_code=404, detail="No brands found")

    # Select a random brand
    random_brand = random.choice(all_brands)

    # Get the current user's ID
    user_id = current_user["user_id"]

    # Get recommended product IDs for the user
    recommended_product_ids = recommend_products_logic(user_id, session)

    # Fetch products with the random brand and filter by recommended product IDs
    products_with_brand = session.exec(
        select(Product).where(
            Product.brand == random_brand,
            Product.product_id.in_(recommended_product_ids),
        )
    ).all()

    # If fewer than 8 products are found, add random products of the same brand
    if len(products_with_brand) < top_n:
        additional_products = session.exec(
            select(Product).where(
                Product.brand == random_brand,
                Product.product_id.not_in([p.product_id for p in products_with_brand]),
            )
        ).all()

        # Randomly sample additional products to fill the gap
        gap = top_n - len(products_with_brand)
        additional_products = random.sample(additional_products, min(len(additional_products), gap))
        products_with_brand.extend(additional_products)

    # Limit the final list to top_n products
    top_products = products_with_brand[:top_n]

    return {"brand": random_brand, "recommended_products": top_products}


