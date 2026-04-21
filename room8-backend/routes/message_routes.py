from flask import Blueprint, request, jsonify
from room8_models import db
from room8_models.message import Message

message_bp = Blueprint("message", __name__, url_prefix="/api/chat")


@message_bp.route("/<int:peer_id>", methods=["POST"])
def send_message(peer_id):
    data = request.get_json(force=True) or {}
    user_id = data.get("user_id")
    text = data.get("text", "").strip()

    if not user_id or not text:
        return jsonify({"error": "user_id and text required"}), 400

    msg = Message(sender_id=user_id, recipient_id=peer_id, text=text)
    db.session.add(msg)
    db.session.commit()

    return jsonify({"ok": True}), 201


@message_bp.route("/<int:peer_id>", methods=["GET"])
def get_conversation(peer_id):
    user_id = request.args.get("user_id", type=int)
    if not user_id:
        return jsonify({"error": "user_id query param required"}), 400

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
