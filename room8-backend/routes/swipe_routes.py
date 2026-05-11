from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from room8_models import db
from room8_models.swipe import Swipe

swipe_bp = Blueprint("swipe", __name__, url_prefix="/api/swipe")


@swipe_bp.route("/like", methods=["POST"])
@jwt_required()
def like():
    user_id   = get_jwt_identity()
    data      = request.get_json(force=True) or {}
    target_id = data.get("target_id")

    if not target_id:
        return jsonify({"error": "target_id required"}), 400
    if target_id == user_id:
        return jsonify({"error": "Cannot swipe yourself"}), 400

    # Upsert: ignore if already swiped
    existing = Swipe.query.filter_by(user_id=user_id, target_id=target_id).first()
    if not existing:
        db.session.add(Swipe(user_id=user_id, target_id=target_id, action="like"))
        db.session.commit()

    # Check for mutual match
    matched = Swipe.query.filter_by(
        user_id=target_id, target_id=user_id, action="like"
    ).first() is not None

    return jsonify({"ok": True, "matched": matched})


@swipe_bp.route("/skip", methods=["POST"])
@jwt_required()
def skip():
    user_id   = get_jwt_identity()
    data      = request.get_json(force=True) or {}
    target_id = data.get("target_id")

    if not target_id:
        return jsonify({"error": "target_id required"}), 400

    existing = Swipe.query.filter_by(user_id=user_id, target_id=target_id).first()
    if not existing:
        db.session.add(Swipe(user_id=user_id, target_id=target_id, action="skip"))
        db.session.commit()

    return jsonify({"ok": True})
