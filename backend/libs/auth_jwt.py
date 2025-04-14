import jwt
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from enum import Enum
from datetime import datetime, timezone, timedelta
from os import getenv
from dotenv import load_dotenv
from models import UserTable  # Might not be used, but we'll allow it for future ambitions

# Load environment variables like a responsible adult
load_dotenv()

# Constants (Because magic strings are for amateurs)
JWT_ALGORITHM = "HS256"
JWT_SECRET = getenv("JWT_SECRET", "super-secret-default-key")  # Don't ship your prod secret key, please
IMGKIT_PUBLIC_KEY = getenv("IKIOPU")
IMGKIT_URL_ENDPOINT = getenv("IKIOEND")


class ExpiryTime(int, Enum):
    """Token expiry times so your sessions don’t last longer than your gym membership."""
    ONE_MINUTE = 60
    FIVE_MINUTES = 5 * 60
    FIFTEEN_MINUTES = 15 * 60
    THIRTY_MINUTES = 30 * 60
    ONE_HOUR = 60 * 60
    TWO_HOURS = 2 * 60 * 60
    FOUR_HOURS = 4 * 60 * 60
    ONE_DAY = 24 * 60 * 60


def decode_jwt(token: str) -> dict:
    """
    Decodes a JWT token and returns its payload.
    Returns an empty dict if it’s expired, invalid, or just plain wrong.
    """
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        print("🔒 Token has expired. RIP.")
        return {}
    except jwt.InvalidTokenError:
        print(f"🚫 Invalid token: {token}")
        return {}


def sign_jwt(user_info: dict, expiration: int = ExpiryTime.ONE_DAY) -> dict:
    """
    Signs a JWT with user info and gives you both access and refresh tokens.
    Basically, your VIP pass to the backend lounge.
    """
    now = datetime.now(timezone.utc)
    expiry = now + timedelta(seconds=expiration)
    refresh_expiry = expiry + timedelta(seconds=ExpiryTime.FIFTEEN_MINUTES)

    payload = {
        "user_name": user_info.get("user_name"),
        "user_id": user_info.get("user_id"),
        "role": user_info.get("role"),
        "exp": expiry.timestamp(),
        "iat": now.timestamp(),
    }

    refresh_payload = {
        **payload,
        "exp": refresh_expiry.timestamp()
    }

    return {
        "user_name": payload["user_name"],
        "role": payload["role"],
        "user_id": payload["user_id"],
        "access_token": jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM),
        "refresh_token": jwt.encode(refresh_payload, JWT_SECRET, algorithm=JWT_ALGORITHM),
        "expiry_time": expiry,
        "issued_at": now,
        # Feel free to uncomment these if your frontend gets thirsty for images
        "imgkit_public_key": IMGKIT_PUBLIC_KEY,
        "imgkit_url_endpoint": IMGKIT_URL_ENDPOINT,
    }


class JWTBearer(HTTPBearer):
    """
    Custom JWT auth class for FastAPI.
    Checks your token like a nightclub bouncer, but more polite.
    """
    def __init__(self, auto_error: bool = True):
        super().__init__(auto_error=auto_error)

    async def __call__(self, request: Request):
        credentials: HTTPAuthorizationCredentials = await super().__call__(request)
        if not credentials:
            raise HTTPException(status_code=401, detail="🛑 No credentials provided.")
        if credentials.scheme != "Bearer":
            raise HTTPException(status_code=401, detail="🧢 Invalid authentication scheme.")
        if not self.verify_jwt(credentials.credentials):
            raise HTTPException(status_code=401, detail="💀 Invalid or expired token.")
        return credentials.credentials

    def verify_jwt(self, jwt_token: str) -> bool:
        return bool(decode_jwt(jwt_token))  # True if payload exists


def get_current_user(token: str = Depends(JWTBearer())) -> dict:
    """
    Dependency that gives you the current logged-in user's token payload.
    Aka: your session’s spirit animal.
    """
    return decode_jwt(token)
