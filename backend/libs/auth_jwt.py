import jwt
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from enum import Enum
from datetime import datetime, timezone, timedelta
from models import UserTable
from dotenv import load_dotenv
load_dotenv()
from os import getenv
JWT_ALGORITHM = "HS256"
JWT_SECRET = "63622b9b424e32212a1947ffcf3342748a41f4808540641c2a9469ba2ab489a0"
IMGKIT_PUBLIC_KEY = getenv("IKIOPU")
IMGKIT_URL_ENDPOINT = getenv("IKIOEND")
class ExpiryTime(int, Enum):
    ONE_MINUTE = 60
    FIVE_MINUTES = 5 * 60
    FIFTEEN_MINUTES = 15 * 60
    THIRTY_MINUTES = 30 * 60
    ONE_HOUR = 60 * 60
    TWO_HOURS = 2 * 60 * 60
    FOUR_HOURS = 4 * 60 * 60
    ONE_DAY = 24 * 60 * 60


def decode_jwt(token: str) -> dict:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        print("Token has expired")
        return {}
    except jwt.InvalidTokenError:
        print("Invalid token " + token)
        return {}


def sign_jwt(user_info: object, expiration: int = ExpiryTime.ONE_DAY) -> dict:
    # user_info = {
    #     "user_name": "",
    #     "user_id": "",
    #     "role": ""
    # }
    

    now_timestamp = datetime.now(timezone.utc).timestamp()
    expiry_time = now_timestamp + expiration
    user_info['exp']=expiry_time
    user_info['iat']=datetime.now(timezone.utc).timestamp()
    payload = user_info
    payload_refresh = payload
    payload_refresh['exp'] += ExpiryTime.FIFTEEN_MINUTES

    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    refresh_token = jwt.encode(payload_refresh, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {
        "user_name": user_info.get("user_name"),
        "role": user_info.get('role'),
        "user_id": user_info.get('user_id'),
        "access_token": token,
        "refresh_token": refresh_token,
        "expiry_time": datetime.fromtimestamp(expiry_time),
        "issued_at": datetime.fromtimestamp(now_timestamp),
        # "imgkit_public_key": IMGKIT_PUBLIC_KEY,
        # "imgkit_url_endpoint": IMGKIT_URL_ENDPOINT,
    }


class JWTBearer(HTTPBearer):
    def __init__(self, auto_error: bool = True):
        super(JWTBearer, self).__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super(
            JWTBearer, self
        ).__call__(request)
        if not credentials:
            raise HTTPException(status_code=401, detail="Invalid authorization code.")
        if credentials.scheme != "Bearer":
            raise HTTPException(
                status_code=401, detail="Invalid authentication scheme."
            )
        if not self.verify_jwt(credentials.credentials):
            raise HTTPException(
                status_code=401, detail="Invalid token or expired token."
            )
        return credentials.credentials

    def verify_jwt(self, jwt_token: str) -> bool:
        try:
            payload = decode_jwt(jwt_token)
        except Exception:
            payload = None
        return bool(payload)


def get_current_user(token: str = Depends(JWTBearer())) -> dict:
    return decode_jwt(token)