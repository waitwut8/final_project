from models import UserTable, Product
from sqlmodel import select
from dependencies import SessionDep
from random import choice

def random_user_id(session: SessionDep):
    return choice(session.exec(select(UserTable)).all()).id


def random_cart_list(session: SessionDep):
    return [choice(session.exec(select(Product)).all()).product_id for _ in range(5)]