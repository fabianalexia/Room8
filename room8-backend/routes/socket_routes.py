# routes/socket_routes.py — Flask-SocketIO event handlers
from flask import request, session
from flask_socketio import join_room, leave_room
from flask_jwt_extended import decode_token

from extensions import socketio


def _room_name(a, b):
    """Stable room name for a conversation pair, independent of join order."""
    return f"conversation_{min(a, b)}_{max(a, b)}"


def _auth_user():
    """
    Decode the JWT passed as ?token= in the connection query string.
    Returns int user_id on success, or None if the token is missing/invalid.
    """
    token = request.args.get("token", "")
    if not token:
        return None
    try:
        data = decode_token(token)
        return int(data["sub"])
    except Exception:
        return None


# ── Connection lifecycle ───────────────────────────────────────────────────────

@socketio.on("connect")
def on_connect(auth):
    user_id = _auth_user()
    if not user_id:
        return False  # reject unauthenticated connections
    session["user_id"] = user_id
    join_room(f"user_{user_id}")


@socketio.on("disconnect")
def on_disconnect():
    user_id = session.get("user_id")
    if user_id:
        leave_room(f"user_{user_id}")


# ── Conversation rooms ─────────────────────────────────────────────────────────

@socketio.on("join_conversation")
def on_join_conversation(data):
    user_id = session.get("user_id")
    if not user_id:
        return
    try:
        peer_id = int(data.get("peer_id", 0))
    except (TypeError, ValueError):
        return
    if not peer_id or peer_id == user_id:
        return
    join_room(_room_name(user_id, peer_id))


@socketio.on("leave_conversation")
def on_leave_conversation(data):
    user_id = session.get("user_id")
    if not user_id:
        return
    try:
        peer_id = int(data.get("peer_id", 0))
    except (TypeError, ValueError):
        return
    if not peer_id:
        return
    leave_room(_room_name(user_id, peer_id))
