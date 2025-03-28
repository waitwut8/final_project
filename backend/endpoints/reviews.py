from models import Product, UserTable, Review
from sqlmodel import select, func
from fastapi import HTTPException, APIRouter, Depends, Request
from dependencies import SessionDep
from libs.auth_jwt import get_current_user
from libs.lib_sender import send_email, generic_email
import copy


import datetime

router = APIRouter(
    prefix="/reviews",
    tags=["review"],
)

@router.get("/")
async def get_your_reviews(session: SessionDep, current_user=Depends(get_current_user)):
    reviews = session.exec(
        select(Review).where(Review.user_id == current_user.get("user_id"))
    ).all()
    return reviews

@router.get("/product/{product_id}")
async def get_product_reviews(session: SessionDep, product_id: int):
    reviews = session.exec(
        select(Review).where(Review.product_id == product_id)
    ).all()
    return reviews

@router.get("/user/{user_id}")
async def get_user_reviews(session: SessionDep, user_id: int):
    reviews = session.exec(
        select(Review).where(Review.user_id == user_id)
    ).all()
    return reviews
@router.post("/add")
async def add_review(request: Request, session: SessionDep, current_user=Depends(get_current_user)):
    request = await request.json()
    product_id = request.get("product_id")
    rating = request.get("rating")
    review = request.get("review")
    if (product_id is None) or (rating is None) or (review is None):
        raise HTTPException(status_code=400, detail="Missing product_id, rating or review")
    review = Review(
        user_id=current_user.get("user_id"),
        product_id=product_id,
        rating=rating,
        review=review,
        created_at=datetime.datetime.now(),
    )
    session.add(review)
    session.commit()
    return review


