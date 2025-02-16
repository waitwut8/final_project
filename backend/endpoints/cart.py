from models import Cart, CartItem, Product
from sqlmodel import select
from fastapi import HTTPException, APIRouter, Depends
from dependencies import SessionDep
from libs.auth_jwt import get_current_user
import json
from sqlalchemy import text

router = APIRouter(
    prefix="/cart",
    tags=["cart"],
    responses={404: {"description": "Not found"}},
)


# Helper function to fetch the cart of the current user
def get_cart(session, user_id: int) -> Cart:
    cart = session.exec(select(Cart).where(Cart.user_id == user_id)).first()
    if not cart:
        cart = Cart(user_id=user_id, items=[], total=0, discounted_total=0)
        # session.add(cart)
        # session.commit()
    return cart


# Helper function to fetch the CartItem by product_id
def get_cart_item(session, product_id: int) -> Product:
    item = session.exec(select(Product).where(Product.product_id == product_id)).first()
    if not item:
        raise HTTPException(status_code=404, detail="Product not found")
    # print(item)
    return item


@router.get("/")  # Get all cart items
async def get_your_cart(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    return cart.items


@router.post("/add/{product_id}")  # Add a product to cart
async def add_to_cart(
    product_id: int, session: SessionDep, current_user=Depends(get_current_user)
):
    cart = session.exec(
        select(Cart).where(Cart.user_id == current_user.get("user_id"))
    ).one()

    item = get_cart_item(session, product_id)

    try:
        if item not in cart.items:
            print("not in cart")

            cart.items = cart.items + [item.model_dump()]

            cart = cart.sqlmodel_update(cart.model_dump())

            print(cart.id)
            session.add(cart)
            session.commit()

            print(get_cart(session, current_user.get("user_id")))

        else:
            print("in cart")
    except Exception as e:
        print(e)
    return item


@router.delete("/remove/{product_id}")  # Remove a product from cart
async def remove_from_cart(
    product_id: int, session: SessionDep, current_user=Depends(get_current_user)
):
    cart = get_cart(session, current_user.get("user_id"))
    item = get_cart_item(session, product_id)
    if item in cart.items:
        cart.items.remove(item)
        session.commit()
    else:
        raise HTTPException(status_code=404, detail="Product not in cart")
    return {"message": "Product removed from cart"}


@router.delete("/clear")  # Clear cart
async def clear_cart(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    cart.items.clear()
    session.commit()
    return {"message": "Cart cleared"}


@router.get("/checkout")  # Checkout
async def checkout(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    if not cart.items:
        raise HTTPException(status_code=404, detail="Cart is empty")
    total = sum(item.total for item in cart.items)
    cart.items.clear()
    session.commit()
    return {"message": "Checkout successful", "total": total}
