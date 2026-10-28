from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from room8_models import db
from room8_models.user import User
from school_gate import status_for

school_bp = Blueprint("school", __name__, url_prefix="/api/schools")


@school_bp.get("/status")
@jwt_required()
def my_school_status():
    """Unlock status + progress for the caller's school (drives the waitlist screen)."""
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    data = status_for(user.school)
    data["you_count"] = bool(user.is_verified_student and user.email_verified)
    return jsonify(data)
