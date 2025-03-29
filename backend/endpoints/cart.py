from models import Cart, CartItem, Product, Order
from sqlmodel import select, func
from fastapi import HTTPException, APIRouter, Depends
from dependencies import SessionDep
from libs.auth_jwt import get_current_user
import copy
from libs.lib_sender import send_email, generic_email

import datetime
router = APIRouter(
    prefix="/cart",
    tags=["cart"],
    responses={404: {"description": "Not found"}},
)



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



@router.get("/")
async def get_your_cart(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    return cart.items



@router.post("/remove/{product_id}")
async def remove_from_cart(
    product_id: int, session: SessionDep, current_user=Depends(get_current_user)
):
    cart = get_cart(session, current_user.get("user_id"))
    if product_id not in cart.items:
        raise HTTPException(status_code=404, detail="Product not in cart")
    
    cart.items = copy.deepcopy(cart.items)
    cart.items.remove(product_id)
    
    session.add(cart)
    session.commit()
    return {"message": "Product removed from cart"}



@router.post("/add/{product_id}")
async def add_to_cart(
    product_id: int, session: SessionDep, current_user=Depends(get_current_user)
):
    cart = get_cart(session, current_user.get("user_id"))
    
    
    cart.items = cart.items + [product_id]
    session.add(cart)
    session.commit()
    return {"message": "Product added to cart"}



@router.post("/remove_all/{product_id}")
async def remove_all_from_cart(
    product_id: int, session: SessionDep, current_user=Depends(get_current_user)
):
    cart = get_cart(session, current_user.get("user_id"))
    
    cart.items = [item for item in cart.items if item != product_id]
    session.add(cart)
    session.commit()
    return {"message": "All instances of the product removed from cart"}



@router.get("/total")
async def get_cart_total(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    total = sum(product.price for product in (get_product(session, item_id) for item_id in cart.items))
    return {"total": total}



@router.delete("/clear")
async def clear_cart(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    
    cart.items = copy.deepcopy(cart.items)
    cart.items = []
    session.add(cart)
    session.commit()
    return {"message": "Cart cleared"}



@router.get("/checkout")
async def checkout(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    if not cart.items:
        raise HTTPException(status_code=404, detail="Cart is empty")

    
    total = sum(product.price for product in (get_product(session, item_id) for item_id in cart.items))

    
    order = Order(
        user_id=current_user.get("user_id"),
        total=total,
        items=cart.items,  
        status="pending",
         
    )
    session.add(order)
    session.commit()
    new_items = cart.items
    
    cart.items = []  
    session.commit()
    
    def get_products_by_ids(session, product_ids: list) -> list:
        products = session.exec(select(Product).where(Product.product_id.in_(product_ids))).all()
        return products
    
    
    products = get_products_by_ids(session, new_items)
    product_dict = {}
    for product in products:
        if product.product_id in product_dict:
            product_dict[product.product_id]["quantity"] += 1
        else:
            product_dict[product.product_id] = {
                "name": product.title,
                "quantity": 1,
                "price": product.price,
            }
    products = [
        {"name": details["name"], "quantity": details["quantity"], "price": details["price"]}
        for details in product_dict.values()
    ]
    context = {
        "customer_name": current_user['user_name'],
        "order_items": products,
        "total_amount": 0,
        "current_year": 2025,
    }
    for product in products:
        product_obj = session.exec(select(Product).where(Product.title == product["name"])).first()
        if product_obj:
            if product_obj.stock < product["quantity"]:
                raise HTTPException(status_code=400, detail=f"Not enough stock for {product['name']}")
            product_obj.stock -= product["quantity"]
            session.add(product_obj)
        else:
            raise HTTPException(status_code=404, detail=f"Product {product['name']} not found")
    session.commit()
    send_email("waitwut8@gmail.com", "waitwut8@gmail.com", "Order Confirmation", generic_email(context, "checkout.html"))
    
    return {"message": "Checkout successful", "order_id": order.id, "total": total}

    
@router.get("/count")
async def get_cart_item_count(session: SessionDep, current_user=Depends(get_current_user)):
    cart = get_cart(session, current_user.get("user_id"))
    item_count = len(cart.items)
    return {"item_count": item_count}