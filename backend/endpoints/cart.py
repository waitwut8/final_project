from models import Cart, CartItem, Product, Order
from sqlmodel import select, func
from fastapi import HTTPException, APIRouter, Depends
from dependencies import SessionDep
from libs.auth_jwt import get_current_user
import copy

router = APIRouter(
    prefix="/cart",
    tags=["cart"],
    responses={404: {"description": "Not found"}},
)


# Helper function to fetch the cart of the current user or create it if not exists
def get_cart(session, user_id: int) -> Cart:
    cart = session.exec(select(Cart).where(Cart.user_id == user_id)).first()
    if not cart:
        cart = Cart(user_id=user_id, items=[], total=0, discounted_total=0)
        session.add(cart)
        session.commit()  # Create cart if it doesn't exist
    return cart


# Helper function to fetch a product by its product_id
def get_product(session, product_id: int) -> Product:
    product = session.exec(select(Product).where(Product.product_id == product_id)).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# Get all cart items
@router.get("/")
async def get_your_cart(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    return cart.items


# Remove a product from the cart
@router.post("/remove/{product_id}")
async def remove_from_cart(
    product_id: int, session: SessionDep, current_user=Depends(get_current_user)
):
    cart = get_cart(session, current_user.get("user_id"))
    if product_id not in cart.items:
        raise HTTPException(status_code=404, detail="Product not in cart")
    # Rebuild the list without the product
    cart.items = copy.deepcopy(cart.items)
    cart.items.remove(product_id)
    
    session.add(cart)
    session.commit()
    return {"message": "Product removed from cart"}


# Add a product to the cart
@router.post("/add/{product_id}")
async def add_to_cart(
    product_id: int, session: SessionDep, current_user=Depends(get_current_user)
):
    cart = get_cart(session, current_user.get("user_id"))
    if product_id in cart.items:
        raise HTTPException(status_code=400, detail="Product already in cart")
    # Rebuild the list to add the new item
    cart.items = cart.items + [product_id]
    session.add(cart)
    session.commit()
    return {"message": "Product added to cart"}


# Remove all instances of a product from the cart
@router.post("/remove_all/{product_id}")
async def remove_all_from_cart(
    product_id: int, session: SessionDep, current_user=Depends(get_current_user)
):
    cart = get_cart(session, current_user.get("user_id"))
    # Rebuild the list without all instances of the product
    cart.items = [item for item in cart.items if item != product_id]
    session.add(cart)
    session.commit()
    return {"message": "All instances of the product removed from cart"}


# Get total of the cart
@router.get("/total")
async def get_cart_total(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    total = sum(product.price for product in (get_product(session, item_id) for item_id in cart.items))
    return {"total": total}


# Clear the cart
@router.delete("/clear")
async def clear_cart(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    # Clear the list by setting it to an empty list
    cart.items = copy.deepcopy(cart.items)
    cart.items = []
    session.add(cart)
    session.commit()
    return {"message": "Cart cleared"}


# Checkout and create an order from the cart
@router.get("/checkout")
async def checkout(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    if not cart.items:
        raise HTTPException(status_code=404, detail="Cart is empty")

    # Calculate the total
    total = sum(product.price for product in (get_product(session, item_id) for item_id in cart.items))

    # Create the order and add it to the 'orders' table
    order = Order(
        user_id=current_user.get("user_id"),
        total=total,
        items=cart.items,  # Copy items to order
        status="pending",  # You can modify this to your needs
    )
    session.add(order)
    session.commit()

    # Clear the cart after creating the order
    cart.items = []  # Rebuild the list to clear it
    session.commit()

    return {"message": "Checkout successful", "order_id": order.id, "total": total}
