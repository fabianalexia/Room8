from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from room8_models import db
from room8_models.message import Message
from room8_models.swipe import Swipe
from utils import sanitize

message_bp = Blueprint("message", __name__, url_prefix="/api/chat")

MAX_MESSAGE_LEN = 1000


@message_bp.route("/<int:peer_id>", methods=["POST"])
@jwt_required()
def send_message(peer_id):
    user_id = get_jwt_identity()

    # Only matched users may message each other
    my_like   = Swipe.query.filter_by(user_id=user_id, target_id=peer_id, action="like").first()
    peer_like = Swipe.query.filter_by(user_id=peer_id, target_id=user_id, action="like").first()
    if not my_like or not peer_like:
        return jsonify({"error": "You can only message your matches"}), 403

    data = request.get_json(force=True) or {}
    text = (data.get("text") or "").strip()

    if not text:
        return jsonify({"error": "text required"}), 400
    if len(text) > MAX_MESSAGE_LEN:
        return jsonify({"error": f"Message too long (max {MAX_MESSAGE_LEN} characters)"}), 400

    text = sanitize(text)

    msg = Message(sender_id=user_id, recipient_id=peer_id, text=text)
    db.session.add(msg)
    db.session.commit()

    return jsonify({"ok": True}), 201


@message_bp.route("/<int:peer_id>", methods=["GET"])
@jwt_required()
def get_conversation(peer_id):
    user_id = get_jwt_identity()

    my_like   = Swipe.query.filter_by(user_id=user_id, target_id=peer_id, action="like").first()
    peer_like = Swipe.query.filter_by(user_id=peer_id, target_id=user_id, action="like").first()
    if not my_like or not peer_like:
        return jsonify({"error": "You can only view conversations with your matches"}), 403

    messages = (
        Message.query.filter(
            ((Message.sender_id == user_id) & (Message.recipient_id == peer_id))
            | ((Message.sender_id == peer_id) & (Message.recipient_id == user_id))
        )
        .order_by(Message.created_at.asc())
        .all()
    )

    return jsonify([
        {
            "sender_id": m.sender_id,
            "text": m.text,
            "created_at": m.created_at.isoformat(),
        }
        for m in messages
    ])
