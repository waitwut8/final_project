from datetime import datetime, timedelta
from sqlmodel import Session, select
from models import Order, Product
from collections import Counter
import random



def top_products(session: Session):
    """Top 20 products by quantity."""
    prod_q = {}
    products = session.exec(select(Product)).all()
    for o in session.exec(select(Order)).all():

        items = [
            {"title": title, "quantity": quantity}
            for title, quantity in Counter(o.items).items()
        ]
        for item in items:
            product = [p for p in products if p.product_id == item["title"]]
            if len(product) > 0:
                product = product[0]
                item["title"] = product.title
        for p in items:
            prod_q[p["title"]] = prod_q.get(p["title"], 0) + p["quantity"]
    top_products_list = [
        {"title": title, "quantity": quantity}
        for title, quantity in sorted(prod_q.items(), key=lambda x: x[1], reverse=True)[
            :20
        ]
    ]
    top_products_list = [
        [item["title"] for item in top_products_list],
        [item["quantity"] for item in top_products_list],
    ]

    return top_products_list


def rev_over_time(session: Session):
    """Revenue over time."""
    rev = {}

    for o in session.exec(select(Order)).all():

        if o.created_at:
            d = datetime.strptime(o.created_at, "%Y-%m-%d %H:%M:%S.%f").date()

            for i in o.items:

                if price := session.exec(
                    select(Product).where(Product.product_id == i)
                ).first():
                    price = price.price
                    quantity = Counter(o.items)[i]
                    if d not in rev:
                        rev[d] = 0
                    rev[d] += price * quantity

    dates, amounts = zip(*sorted(rev.items())) if rev else ([], [])

    all_dates = (
        [dates[0] + timedelta(days=i) for i in range((dates[-1] - dates[0]).days + 1)]
        if dates
        else []
    )
    amounts = [rev.get(d, 0) for d in all_dates]
    return [
        all_dates,
        amounts,
        sum(
            a
            for d, a in zip(all_dates, amounts)
            if d >= (datetime.now() - timedelta(days=2)).date()
        ),
    ]


def plot_orders_over_time(session: Session):
    """Count orders per day."""
    cnt = {}
    for o in session.exec(select(Order)).all():
        if o.created_at:
            d = datetime.strptime(o.created_at, "%Y-%m-%d %H:%M:%S.%f").date()
            cnt[d] = cnt.get(d, 0) + 1
    dates, counts = zip(*sorted(cnt.items())) if cnt else ([], [])
    all_dates = (
        [dates[0] + timedelta(days=i) for i in range((dates[-1] - dates[0]).days + 1)]
        if dates
        else []
    )
    counts = [cnt.get(d, 0) for d in all_dates]
    return (
        all_dates,
        counts,
        sum(
            c
            for d, c in zip(all_dates, counts)
            if d >= (datetime.now() - timedelta(days=2)).date()
        ),
    )


def prod_over_time(session: Session):
    """Track product quantities over time."""
    prod_counts = {}
    for o in session.exec(select(Order)).all():
        if o.created_at:
            d = datetime.strptime(o.created_at, "%Y-%m-%d %H:%M:%S.%f").date()
            for p in o.items:
                prod_counts[d] = prod_counts.get(d, 0) + Counter(o.items)[p]
    dates, counts = zip(*sorted(prod_counts.items())) if prod_counts else ([], [])
    all_dates = (
        [dates[0] + timedelta(days=i) for i in range((dates[-1] - dates[0]).days + 1)]
        if dates
        else []
    )
    counts = [prod_counts.get(d, 0) for d in all_dates]
    return (
        all_dates,
        counts,
        sum(
            c
            for d, c in zip(all_dates, counts)
            if d >= (datetime.now() - timedelta(days=2)).date()
        ),
    )


def generate_order(user_id: int, session: Session, status="Pending"):
    products_query = select(Product)
    products = session.exec(products_query).all()
    selected_products = random.sample(products, random.randint(1, 8))
    times_to_add = [random.randint(1, 10) for _ in selected_products]
    items = []
    for product, times in zip(selected_products, times_to_add):
        items.extend([product.product_id] * times)
    order = Order(
        user_id=user_id,
        items=items,
        status=status,
        created_at=datetime.now() - timedelta(days=random.randint(-14, 14)),
        updated_at=datetime.now(),
        total=0,
    )
    session.add(order)
    session.commit()

    return order
