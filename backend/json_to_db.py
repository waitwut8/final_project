from sqlmodel import select
import json
from models import Product


from libs.lib_sender import *
from sqlmodel import Session
from database import engine
def read_json_file(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data
data = read_json_file('products.json')
def add_data_to_db(session, data):
    id = 1
    for item in data:
        user = Product(**{
            'product_id': id,  # Ensure product_id is included
            'title': item.get('title'),
            'description': item.get('description'),
            'price': item.get('price'),
            'stock': item.get('stock'),
            'tags': item.get('tags'),
            'brand': item.get('brand'),
            'images': item.get('images'),
            'thumbnail': item.get('thumbnail')
        })
        print(item.get('title'))
        session.add(user)
        session.commit()
        id+=1


with Session(engine) as session:
    add_data_to_db(session, data)