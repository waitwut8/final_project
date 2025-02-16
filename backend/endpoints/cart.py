from models import Cart, CartItem, Product
from sqlmodel import select
from fastapi import HTTPException, APIRouter, Depends
from dependencies import SessionDep
from libs.auth_jwt import get_current_user
import json

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
        session.add(cart)
        session.commit()
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
async def add_to_cart(product_id: int, session: SessionDep, current_user=Depends(get_current_user)):
    # cart = get_cart(session, current_user.get("user_id"))
    cart = session.exec(select(Cart).where(Cart.user_id == current_user.get("user_id")))
    cart_data = cart.first()
    item = get_cart_item(session, product_id)
    # print(item.model_dump() in cart.items)
    # print(type(item), type(cart.items))
    # id: Optional[str] = None
    # title: Optional[str] = None
    # price: Optional[float] = None
    # discount_percentage: Optional[float] = None
    # thumbnail: Optional[str] = None
    # quantity: Optional[int] = 0
    print(item)
    print(cart_data)
    try:
        if item not in cart_data.items:
            print("not in cart")
            cart_data.items.append(item.model_dump_json())
            cart_data.sqlmodel_update(cart_data.model_dump())
            session.add(cart_data)
            session.commit()
            session.refresh(cart_data)
            # print("not in cart")
            # cart_data.items.append(item.model_dump_json())
            # print(f"1... {cart}")
            # cart.sqlmodel_update(cart.model_dump())
            # session.add(cart)
            # # new_data = Cart.model_validate(cart)
            # # Cart.sqlmodel_update(session, new_data)
            # # # session._update_impl
            # session.commit()
            # session.refresh(cart)
            # print(f"2...{cart}")
        else:
            print("in cart")
    except Exception as e:
        print(e)
    return item
    # try:
    #     if item not in cart.items:
    #         cart.items.append(CartItem(**{
    #             "id": item.product_id,
    #             "title": item.title,
    #             "price": item.price,
    #             "discount_percentage": 0,
    #             "thumbnail": item.thumbnail,
    #             "quantity": 1
    #         }))
    #         # session.refresh(cart)
    #         print(cart)
    #         print("step 1")
    #         session.add(cart)
    #         print("step 2")
    #         session.commit()
    #         print("step 3")
    #         session.refresh(cart)
            
    #     else:
    #         print('Product already in cart')
    # except Exception as e:
    #     print(e)
    #     print('something went wrong')
    # return {"message": "Product added to cart"}

@router.delete("/remove/{product_id}")  # Remove a product from cart
async def remove_from_cart(product_id: int, session: SessionDep, current_user=Depends(get_current_user)):
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
