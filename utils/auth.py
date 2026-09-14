import bcrypt

def hash_password(password):
    password_bytes = password.encode("utf-8")
    hashed = bcrypt.hashpw(
        password_bytes,
        bcrypt.gensalt()
    )
    return hashed.decode("utf-8")

def verify_password(password, password_hash):
    return bcrypt.checkpw(
        password.encode("utf-8"),
        password_hash.encode("utf-8")
    )

from utils.database import get_user_by_email

def login_user(email, password):
    user = get_user_by_email(email)

    if user is None:
        return None

    password_hash = user[3]

    if verify_password(password, password_hash):
        return user

    return None 