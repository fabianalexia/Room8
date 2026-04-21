from flask import Blueprint, request, jsonify
from room8_models import db
from room8_models.swipe import Swipe

swipe_bp = Blueprint("swipe", __name__, url_prefix="/api/swipe")


@swipe_bp.route("/like", methods=["POST"])
def like():
    data = request.get_json(force=True) or {}
    user_id = data.get("user_id")
    target_id = data.get("target_id")

    if not user_id or not target_id:
        return jsonify({"error": "user_id and target_id required"}), 400

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
def skip():
    data = request.get_json(force=True) or {}
    user_id = data.get("user_id")
    target_id = data.get("target_id")

    if not user_id or not target_id:
        return jsonify({"error": "user_id and target_id required"}), 400

    existing = Swipe.query.filter_by(user_id=user_id, target_id=target_id).first()
    if not existing:
        db.session.add(Swipe(user_id=user_id, target_id=target_id, action="skip"))
        db.session.commit()

    return jsonify({"ok": True})
