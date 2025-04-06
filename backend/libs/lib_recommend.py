from typing import List
import numpy as np
from sqlmodel import Session, select
from sklearn.metrics.pairwise import cosine_similarity

from models import UserTable, Order  # Assuming these models are defined in your project

def get_user_order_matrix(session: Session) -> np.ndarray:
    """
    Create a user-order matrix where rows represent users and columns represent orders.
    """
    users = session.exec(select(UserTable)).all()
    orders = session.exec(select(Order)).all()

    user_ids = [user.id for user in users]
    order_ids = [order.id for order in orders]

    user_order_matrix = np.zeros((len(users), len(orders)))

    for i, user in enumerate(users):
        for j, order in enumerate(orders):
            if order.user_id == user.id:
                user_order_matrix[i, j] = 1  # Mark as purchased

    return user_order_matrix, user_ids, order_ids

def recommend_similar_users(user_id: int, session: Session, top_n: int = 5) -> List[int]:
    """
    Recommend similar users based on cosine similarity.
    """
    user_order_matrix, user_ids, _ = get_user_order_matrix(session)
    user_index = user_ids.index(user_id)

    # Compute cosine similarity
    similarity_matrix = cosine_similarity(user_order_matrix)
    user_similarities = similarity_matrix[user_index]

    # Get top N similar users (excluding the user itself)
    similar_users = np.argsort(-user_similarities)[1:top_n + 1]
    return [user_ids[i] for i in similar_users]

def recommend_products_for_user(user_id: int, session: Session, top_n: int = 5) -> list[int]:
    """
    Recommend products for a user based on similar users' orders.
    """
    user_order_matrix, user_ids, order_ids = get_user_order_matrix(session)
    user_index = user_ids.index(user_id)

    # Compute cosine similarity
    similarity_matrix = cosine_similarity(user_order_matrix)
    user_similarities = similarity_matrix[user_index]

    # Get similar users' indices
    similar_users = np.argsort(-user_similarities)[1:]  # Exclude the user itself

    # Aggregate orders from similar users
    recommended_orders = np.zeros(user_order_matrix.shape[1])
    for similar_user in similar_users:
        recommended_orders += user_order_matrix[similar_user]

    # Exclude orders the user has already made
    user_orders = user_order_matrix[user_index]
    recommended_orders = np.where(user_orders == 0, recommended_orders, 0)

    # Get top N recommended orders
    top_order_indices = np.argsort(-recommended_orders)[:top_n]
    recommended_order_ids = [order_ids[i] for i in top_order_indices]
    print("recommended_order_ids", recommended_order_ids)
    # Retrieve product IDs from the recommended orders
    orders = session.exec(select(Order).where(Order.id.in_(recommended_order_ids))).all()
    recommended_products = set()
    for order in orders:
        recommended_products.update(order.items)  # Assuming `product_ids` is a list of product IDs in the order
    print("before", recommended_products)
    return list(recommended_products)

