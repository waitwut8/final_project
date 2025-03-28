from database import create_db_and_tables, get_session
from typing import Annotated
# from sqlmodel import Session, select
from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
# SessionDep = Annotated[Session, Depends(get_session)]
from endpoints import user, product, cart, analytics, orders, reviews
from dotenv import load_dotenv
from os import getenv
from imagekitio import ImageKit
from libs.auth_jwt import JWTBearer


app = FastAPI(dependencies=[Depends(get_session)])
app.include_router(user.router)
app.include_router(product.router)
app.include_router(cart.router)
app.include_router(analytics.router)
app.include_router(orders.router)
app.include_router(reviews.router)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
create_db_and_tables()
load_dotenv()
@app.get("/")
def read_root():

    return {"Hello": "World"}
ikit = ImageKit(
        private_key=getenv("IKIOPR"),
        public_key=getenv("IKIOPU"),
        url_endpoint=getenv("IKIOEND")
    )
@app.get("/imagekit_auth", dependencies=[Depends(JWTBearer())])
def get_auth():
    print(ikit.get_authentication_parameters())
    return ikit.get_authentication_parameters()

@app.get("/imagekit_public")
def get_public():
    return [getenv("IKIOPU"), getenv("IKIOEND")]