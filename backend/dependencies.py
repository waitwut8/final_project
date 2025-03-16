from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Session
from database import get_session
from fnc.sequences import flattendeep
SessionDep = Annotated[Session, Depends(get_session)]