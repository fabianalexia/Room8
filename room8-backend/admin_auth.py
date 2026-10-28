# admin_auth.py — admin check based on the ADMIN_EMAILS env var
import os
from functools import wraps

from flask import jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from room8_models import db
from room8_models.user import User


def admin_emails() -> set[str]:
    raw = os.environ.get("ADMIN_EMAILS", "")
    return {e.strip().lower() for e in raw.split(",") if e.strip()}


def is_admin(user: User | None) -> bool:
    return bool(user and user.email and user.email.lower() in admin_emails() and user.email_verified)


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = db.session.get(User, int(get_jwt_identity()))
        if not is_admin(user):
            return jsonify({"error": "Forbidden"}), 403
        return fn(*args, admin=user, **kwargs)
    return wrapper
