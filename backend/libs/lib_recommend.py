from typing import List
import numpy as np
from sqlmodel import Session, select
from sklearn.metrics.pairwise import cosine_similarity

from models import UserTable, Order  # Because someone has to model this madness


def get_user_order_matrix(session: Session) -> tuple[np.ndarray, List[int], List[int]]:
    """
    Builds a binary user-order matrix:
    - Rows = users
    - Columns = orders
    - Value = 1 if user placed the order, 0 otherwise

    This function basically stalks users' purchasing behavior in matrix form.
    """
    users = session.exec(select(UserTable)).all()
    orders = session.exec(select(Order)).all()

    user_ids = [user.id for user in users]
    order_ids = [order.id for order in orders]

    user_order_matrix = np.zeros((len(users), len(orders)))

    # Fill the matrix like it's a sudoku but way less fun
    for i, user in enumerate(users):
        for j, order in enumerate(orders):
            if order.user_id == user.id:
                user_order_matrix[i, j] = 1

    return user_order_matrix, user_ids, order_ids


def recommend_similar_users(user_id: int, session: Session, top_n: int = 5) -> List[int]:
    """
    Finds the top N users most similar to the given user based on order history.
    AKA: "Find my shopping soulmate."
    """
    user_order_matrix, user_ids, _ = get_user_order_matrix(session)

    if user_id not in user_ids:
        raise ValueError(f"User ID {user_id} does not exist in the system. Try being more real.")

    user_index = user_ids.index(user_id)

    # Get the matrix of everyone's shopping "vibes"
    similarity_matrix = cosine_similarity(user_order_matrix)

    # Extract this user's similarity vector (aka "who shops like me?")
    user_similarities = similarity_matrix[user_index]

    # Exclude the user themself, because narcissism isn't collaborative filtering
    similar_users = np.argsort(-user_similarities)[1:top_n + 1]

    return [user_ids[i] for i in similar_users]


def recommend_products_for_user(user_id: int, session: Session, top_n: int = 5) -> List[int]:
    """
    Recommends products for a user based on what their similar users bought.
    In other words: "Your friends bought it. Now you will too."
    """
    user_order_matrix, user_ids, order_ids = get_user_order_matrix(session)

    if user_id not in user_ids:
        raise ValueError(f"User ID {user_id} not found. Recommendation denied.")

    user_index = user_ids.index(user_id)

    similarity_matrix = cosine_similarity(user_order_matrix)
    user_similarities = similarity_matrix[user_index]

    # Get indices of users with similar tastes (i.e., shopping twins)
    similar_users = np.argsort(-user_similarities)[1:]

    # Combine orders of similar users into one big peer-pressure recommendation blob
    recommended_orders = np.zeros(user_order_matrix.shape[1])
    for similar_user_index in similar_users:
        recommended_orders += user_order_matrix[similar_user_index]

    # Remove stuff this user already bought. Because surprises are fun.
    user_orders = user_order_matrix[user_index]
    recommended_orders = np.where(user_orders == 0, recommended_orders, 0)

    # Get top N orders with the highest score
    top_order_indices = np.argsort(-recommended_orders)[:top_n]
    recommended_order_ids = [order_ids[i] for i in top_order_indices]

    # Dig out the actual orders from DB so we can steal their product ideas
    orders = session.exec(
        select(Order).where(Order.id.in_(recommended_order_ids))
    ).all()

    recommended_products = set()
    for order in orders:
        # Assuming `order.items` is a list of product IDs, because life is cruel but not *that* cruel
        recommended_products.update(order.items)

    return list(recommended_products)
