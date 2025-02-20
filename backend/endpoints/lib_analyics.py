from datetime import datetime, timedelta
from sqlmodel import Session, select
from sqlalchemy import func
from models import Order, Product

def top_products(session: Session):
    return zip(*session.exec(
        select(Product.title, func.sum(Product.quantity))
        .group_by(Product.title)
        .order_by(func.sum(Product.quantity).desc())
        .limit(20)
    ).all())

def rev_over_time(session: Session):
    result = session.exec(
        select(Order.created_at, func.sum(Product.price * Product.quantity).label('revenue'))
        .join(Product, Order.id == Product.order_id)
        .group_by(Order.created_at.date())
        .order_by(Order.created_at.date())
    ).all()
    dates, revenues = zip(*result) if result else ([], [])
    all_dates = [dates[0] + timedelta(days=i) for i in range((dates[-1] - dates[0]).days + 1)]
    revenues = [next((r for d, r in zip(dates, revenues) if d == ad), 0) for ad in all_dates]
    return all_dates, revenues, sum(r for d, r in zip(all_dates, revenues) if d >= (datetime.now() - timedelta(days=2)).date())

def plot_orders_over_time(session: Session):
    result = session.exec(
        select(Order.created_at.date(), func.count())
        .group_by(Order.created_at.date())
        .order_by(Order.created_at.date())
    ).all()
    dates, counts = zip(*result) if result else ([], [])
    all_dates = [dates[0] + timedelta(days=i) for i in range((dates[-1] - dates[0]).days + 1)]
    counts = [next((c for d, c in zip(dates, counts) if d == ad), 0) for ad in all_dates]
    return all_dates, counts, sum(c for d, c in zip(all_dates, counts) if d >= (datetime.now() - timedelta(days=2)).date())

def prod_over_time(session: Session):
    result = session.exec(
        select(Order.created_at.date(), Product.title, func.sum(Product.quantity))
        .join(Product, Order.id == Product.order_id)
        .group_by(Order.created_at.date(), Product.title)
        .order_by(Order.created_at.date())
    ).all()
    dates = [r[0] for r in result]
    product_counts = {r[1]: [] for r in result}
    for r in result: product_counts[r[1]].append((r[0], r[2]))
    all_dates = [dates[0] + timedelta(days=i) for i in range((dates[-1] - dates[0]).days + 1)]
    for title, counts in product_counts.items(): product_counts[title] = [next((c for d, c in counts if d == ad), 0) for ad in all_dates]
    return all_dates, product_counts, {title: sum(c for d, c in zip(all_dates, counts) if d >= (datetime.now() - timedelta(days=2)).date()) for title, counts in product_counts.items()}
