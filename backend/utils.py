from passlib.context import CryptContext
import hashlib

password_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return password_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    return password_context.hash(password)

def generate_code_from_string(input_string: str) -> str:
    hash_object = hashlib.sha256(input_string.encode())
    return hash_object.hexdigest()[:6]