from fastapi import APIRouter, Request, HTTPException, Depends
from sqlmodel import select
from copy import deepcopy
import random

from models import Post, UserTable, Role  # Role is imported... somewhere it’s being judged
from dependencies import SessionDep
from libs.schemas import LoginInfo
from libs.auth_jwt import sign_jwt, JWTBearer, decode_jwt, get_current_user
from utils import hash_password, verify_password
from libs.lib_sender import *  # Wildcard import, a true YOLO move. We'll allow it.

# The router that handles all things "Post"-al. No stamp required.
router = APIRouter(
    prefix="/post",
    tags=["post"],
    responses={404: {"description": "Not found"}},
)


@router.post("/", response_model=Post)
async def create_post(post: Post, session: SessionDep):
    """
    Create a new post and return the freshly minted masterpiece.
    """
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.get("/random", response_model=list[Post])
async def get_random_posts(session: SessionDep, request: Request):
    """
    Retrieve a list of randomly selected posts. Because chaos is a valid design choice.

    Query Parameters:
        - limit (int, optional): Number of random posts to return (default: 8).

    Returns:
        list[Post]: A beautiful mess of posts randomly yanked from the database.
    """
    try:
        limit = int(request.query_params.get("limit", 8))
    except ValueError:
        raise HTTPException(status_code=400, detail="Limit must be an integer. Like, actually.")

    all_posts = session.exec(select(Post)).all()

    if not all_posts:
        raise HTTPException(status_code=404, detail="No posts found. It's a ghost town out here.")

    # Sample some chaotic content
    random_posts = random.sample(all_posts, min(len(all_posts), limit))

    return random_posts
