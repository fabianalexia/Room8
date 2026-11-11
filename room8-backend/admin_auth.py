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


def admin_user_ids() -> set[int]:
    raw = os.environ.get("ADMIN_USER_IDS", "")
    return {int(x) for x in raw.split(",") if x.strip().isdigit()}


def is_admin(user: User | None) -> bool:
    """Admin = email listed in ADMIN_EMAILS, and either a verified email or the
    account id pinned in ADMIN_USER_IDS (for when verification email is down)."""
    if not (user and user.email and user.email.lower() in admin_emails()):
        return False
    return bool(user.email_verified or user.id in admin_user_ids())


def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user = db.session.get(User, int(get_jwt_identity()))
        if not is_admin(user):
            return jsonify({"error": "Forbidden"}), 403
        return fn(*args, admin=user, **kwargs)
    return wrapper
