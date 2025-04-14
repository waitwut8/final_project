from models import Cart, CartItem, Product, Order, Status
from sqlmodel import select
from fastapi import HTTPException, APIRouter, Depends
from dependencies import SessionDep
from libs.auth_jwt import get_current_user
from libs.lib_sender import send_email, generic_email
import datetime

router = APIRouter(
    prefix="/cart",
    tags=["cart"],
    responses={404: {"description": "Not found"}},
)

# === Utilities ===

def get_cart(session, user_id: int) -> Cart:
    cart = session.exec(select(Cart).where(Cart.user_id == user_id)).first()
    if not cart:
        cart = Cart(user_id=user_id, items=[], total=0, discounted_total=0)
        session.add(cart)
        session.commit()
    return cart

def get_product(session, product_id: int) -> Product:
    product = session.exec(select(Product).where(Product.product_id == product_id)).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# === Routes ===

@router.get("/")
async def get_your_cart(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    return cart.items

@router.post("/add/{product_id}")
async def add_to_cart(product_id: int, session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    cart.items = cart.items + [product_id]
    session.add(cart)
    session.commit()
    return {"message": "Product added to cart"}

@router.post("/remove/{product_id}")
async def remove_from_cart(product_id: int, session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    if product_id not in cart.items:
        raise HTTPException(status_code=404, detail="Product not in cart")
    cart.items.remove(product_id)
    session.add(cart)
    session.commit()
    return {"message": "Product removed from cart"}

@router.post("/remove_all/{product_id}")
async def remove_all_from_cart(product_id: int, session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    cart.items = [item for item in cart.items if item != product_id]
    session.add(cart)
    session.commit()
    return {"message": "All instances of the product removed from cart"}

@router.delete("/clear")
async def clear_cart(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    cart.items.clear()
    session.add(cart)
    session.commit()
    return {"message": "Cart cleared"}

@router.get("/total")
async def get_cart_total(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    total = sum(get_product(session, item_id).price for item_id in cart.items)
    return {"total": total}

@router.get("/count")
async def get_cart_item_count(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    return {"item_count": len(cart.items)}

@router.get("/checkout")
async def checkout(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    if not cart.items:
        raise HTTPException(status_code=404, detail="Cart is empty")

    # Aggregate quantities of products
    item_quantities = {}
    for item_id in cart.items:
        item_quantities[item_id] = item_quantities.get(item_id, 0) + 1

    products = session.exec(select(Product).where(Product.product_id.in_(item_quantities.keys()))).all()

    # Validate stock and calculate total
    total = 0
    email_items = []

    try:
        for product in products:
            quantity = item_quantities[product.product_id]
            if product.stock < quantity:
                product.stock = quantity
            product.stock -= quantity
            session.add(product)
            total += product.price * quantity
            email_items.append({
                "name": product.title,
                "quantity": quantity,
                "price": product.price,
            })

        # Create order
        order = Order(
            user_id=current_user["user_id"],
            total=total,
            items=cart.items,
            status=Status.PENDING.value,
        )
        session.add(order)

        # Clear the cart
        cart.items = []
        session.add(cart)

        session.commit()

        # Send confirmation email
        context = {
            "customer_name": current_user.get("username", "null"),
            "order_items": email_items,
            "total_amount": total,
            "current_year": datetime.datetime.now().year,
        }

        send_email(
            receiver="waitwut8@gmail.com",
            subject="Order Confirmation",
            message=generic_email(context, "checkout.html")
        )

        return {"message": "Checkout successful", "order_id": order.id, "total": total}

    except Exception as e:
        print(e)
        session.rollback()
        raise HTTPException(status_code=500, detail=f"Checkout failed: {str(e)}")
