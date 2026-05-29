from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from room8_models import db
from room8_models.swipe import Swipe
from extensions import socketio
from utils import send_push_notification

swipe_bp = Blueprint("swipe", __name__, url_prefix="/api/swipe")


@swipe_bp.route("/like", methods=["POST"])
@jwt_required()
def like():
    user_id   = int(get_jwt_identity())
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

    if matched:
        # Notify both users via WebSocket so their LikesPage updates instantly
        socketio.emit("new_match", {"with_user": target_id}, room=f"user_{user_id}")
        socketio.emit("new_match", {"with_user": user_id}, room=f"user_{target_id}")

        # Web Push notifications (fires even when the tab is closed)
        try:
            from room8_models.user import User
            liker  = db.session.get(User, user_id)
            target = db.session.get(User, target_id)
            liker_name  = liker.first_name  or "Someone" if liker  else "Someone"
            target_name = target.first_name or "Someone" if target else "Someone"
            send_push_notification(
                user_id,
                "It's a Match! 🎉",
                f"You and {target_name} both liked each other.",
                url="/likes",
            )
            send_push_notification(
                target_id,
                "It's a Match! 🎉",
                f"You and {liker_name} both liked each other.",
                url="/likes",
            )
        except Exception as exc:
            print(f"[push] match notification failed: {exc}")

    return jsonify({"ok": True, "matched": matched})


@swipe_bp.route("/skip", methods=["POST"])
@jwt_required()
def skip():
    user_id   = int(get_jwt_identity())
    data      = request.get_json(force=True) or {}
    target_id = data.get("target_id")

    if not target_id:
        return jsonify({"error": "target_id required"}), 400

    existing = Swipe.query.filter_by(user_id=user_id, target_id=target_id).first()
    if not existing:
        db.session.add(Swipe(user_id=user_id, target_id=target_id, action="skip"))
        db.session.commit()

    return jsonify({"ok": True})
