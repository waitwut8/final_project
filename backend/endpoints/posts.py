from models import UserTable

from sqlmodel import select
from fastapi import HTTPException, APIRouter, Depends, Request, Response
from dependencies import SessionDep
from libs.schemas import LoginInfo
from libs.auth_jwt import sign_jwt, JWTBearer, decode_jwt, get_current_user
from models import Role, Post, UserTable
from utils import hash_password, verify_password
from copy import deepcopy
import random
from libs.lib_sender import *

router = APIRouter(
    prefix="/post",
    tags=["post"],
    responses={404: {"description": "Not found"}},
)
@router.post("/", response_model=Post)
async def create_post(post: Post, session: SessionDep):
    """
    Create a new post.
    """
    session.add(post)
    session.commit()
    session.refresh(post)
    return post




@router.get("/random", response_model=list[Post])
async def get_random_posts(session: SessionDep, request: Request):
    """
    Retrieve a random selection of posts.
    Args:
        session (SessionDep): The database session dependency.
        limit (int): The number of random posts to retrieve (default is 8).
    Returns:
        list: A list of randomly selected posts.
    """
    # Get the 'limit' query parameter from the request, defaulting to 8 if not provided
    limit = int(request.query_params.get("limit", 8))
    # Fetch all posts from the database
    all_posts = session.exec(select(Post)).all()

    # Randomly sample posts, ensuring the limit does not exceed the total number of posts
    random_posts = random.sample(all_posts, min(len(all_posts), limit))
    return random_posts