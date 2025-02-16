from sqlmodel import select
import json
from models import Cart, CartItem  # Import the Cart model


from libs.lib_sender import *
from sqlmodel import Session
from database import engine

def read_json_file(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

data = read_json_file('carts.json')  # Change the file name to carts.json

def convert_json_to_cart(data: dict) -> Cart:
    """
    Converts JSON cart data into a Cart object.
    Ensure that if the data is a list, we take the first element (for single cart case).
    """
    # If `data` is a list, just take the first item (for now).
    if isinstance(data, list):
        data = data[0]  # or raise an error, depending on your needs
    
    # Proceed with cart item conversion logic as before
    items = []
    for product in data.get("products", []):
        item = CartItem(
            id=product.get("id"),
            title=product.get("title"),
            price=product.get("price"),
            discount_percentage=product.get("discountPercentage"),
            thumbnail=product.get("thumbnail"),
            quantity=product.get("quantity", 0)
        ).model_dump()
        items.append(item)
    
    return Cart(
        user_id=data.get("userId"),
        items=items,
        total=data.get("total"),
        discounted_total=data.get("discountedTotal")
    )


def add_data_to_db(session, data):
    """
    Takes JSON data, converts it to a Cart object, and stores it in the database.
    Simple as that. No drama, just solid database action.
    """
    # Convert the JSON data to a Cart object.
    cart = convert_json_to_cart(data)
    
    # Add the Cart to the database and commit it. Data's now officially part of the family.
    session.add(cart)
    session.commit()
    
    print(f"Success! Cart for user {cart.user_id} has been added to the database.")


with Session(engine) as session:
    add_data_to_db(session, data)
