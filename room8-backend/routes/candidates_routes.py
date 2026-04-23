# routes/candidates_routes.py
from flask import Blueprint, jsonify
from sqlalchemy import or_, and_
from room8_models import db
from room8_models.user import User
from room8_models.swipe import Swipe
from room8_models.message import Message
from room8_models.block import Block

candidates_bp = Blueprint("candidates", __name__, url_prefix="/api")


def _exclude_swiped(user_id):
    return {
        row[0]
        for row in db.session.query(Swipe.target_id).filter(Swipe.user_id == user_id).all()
    }


def _exclude_blocked(user_id):
    """IDs the user has blocked, plus IDs that have blocked the user."""
    blocked_by_me = {
        row[0] for row in db.session.query(Block.blocked_id).filter_by(blocker_id=user_id).all()
    }
    blocking_me = {
        row[0] for row in db.session.query(Block.blocker_id).filter_by(blocked_id=user_id).all()
    }
    return blocked_by_me | blocking_me


@candidates_bp.get("/candidates/<int:user_id>")
def get_candidates(user_id: int):
    from flask import request as flask_request
    me = db.session.get(User, user_id)
    if not me:
        return jsonify({"ok": False, "error": "no_such_user"}), 404

    reset = flask_request.args.get("reset") == "true"
    swiped_ids  = set() if reset else _exclude_swiped(user_id)
    blocked_ids = _exclude_blocked(user_id)
    base_q = (
        db.session.query(User)
        .filter(User.id != user_id)
        .filter(~User.id.in_(swiped_ids))
        .filter(~User.id.in_(blocked_ids))
    )

    # Filter by same school if the user has one set
    if me.school:
        same_school = (
            base_q
            .filter(User.school == me.school)
            .order_by(User.id.asc())
            .all()
        )
        if same_school:
            return jsonify([u.public() for u in same_school])
        # Graceful fallback: no one at this school yet — show all
        # (good for testing; in production you'd return empty + "invite friends" prompt)

    people = base_q.order_by(User.id.asc()).all()
    return jsonify([u.public() for u in people])


@candidates_bp.get("/matches/<int:user_id>")
def get_matches(user_id: int):
    me = db.session.get(User, user_id)
    if not me:
        return jsonify({"ok": False, "error": "no_such_user"}), 404

    i_liked_ids = (
        db.session.query(Swipe.target_id)
        .filter_by(user_id=user_id, action="like")
        .subquery()
    )

    partners = (
        db.session.query(User)
        .join(Swipe, Swipe.user_id == User.id)
        .filter(Swipe.action == "like", Swipe.target_id == user_id)
        .filter(User.id.in_(i_liked_ids))
        .order_by(User.id.asc())
        .all()
    )

    result = []
    for partner in partners:
        data = partner.public()
        last_msg = (
            Message.query.filter(
                or_(
                    and_(Message.sender_id == user_id, Message.recipient_id == partner.id),
                    and_(Message.sender_id == partner.id, Message.recipient_id == user_id),
                )
            )
            .order_by(Message.created_at.desc())
            .first()
        )
        data["last_message"]      = last_msg.text if last_msg else None
        data["last_message_at"]   = last_msg.created_at.isoformat() if last_msg else None
        data["last_message_mine"] = (last_msg.sender_id == user_id) if last_msg else None
        result.append(data)

    return jsonify(result)


@candidates_bp.get("/likes/<int:user_id>")
def get_likes(user_id: int):
    """Users who liked me but we haven't matched yet."""
    me = db.session.get(User, user_id)
    if not me:
        return jsonify({"ok": False, "error": "no_such_user"}), 404

    # IDs of people I have already liked back (mutual matches)
    i_liked_ids = {
        row[0]
        for row in db.session.query(Swipe.target_id)
        .filter_by(user_id=user_id, action="like")
        .all()
    }

    # Users who liked me and I haven't liked back yet
    fans = (
        db.session.query(User)
        .join(Swipe, Swipe.user_id == User.id)
        .filter(Swipe.action == "like", Swipe.target_id == user_id)
        .filter(~User.id.in_(i_liked_ids))
        .order_by(User.id.asc())
        .all()
    )

    return jsonify([u.public() for u in fans])


# Keys used in dorm_prefs that we score compatibility on
_COMPAT_KEYS = [
    "sleep_schedule", "cleanliness", "study_habits",
    "guests", "noise", "social", "partying", "smoking",
]


def _compat_score(prefs_a: dict, prefs_b: dict) -> int:
    """Return 0-100 compatibility score between two dorm_prefs dicts."""
    if not prefs_a or not prefs_b:
        return 0
    answered = [k for k in _COMPAT_KEYS if prefs_a.get(k) and prefs_b.get(k)]
    if not answered:
        return 0
    matches = sum(1 for k in answered if prefs_a[k] == prefs_b[k])
    return round(matches / len(answered) * 100)


@candidates_bp.get("/compatibility/<int:user_id>")
def get_compatibility(user_id: int):
    """Returns the user's mutual matches ranked by dorm-pref compatibility score."""
    me = db.session.get(User, user_id)
    if not me:
        return jsonify({"ok": False, "error": "no_such_user"}), 404

    my_prefs = me.get_dorm_prefs()

    # Fetch mutual matches (same query as get_matches)
    i_liked_ids = (
        db.session.query(Swipe.target_id)
        .filter_by(user_id=user_id, action="like")
        .subquery()
    )
    partners = (
        db.session.query(User)
        .join(Swipe, Swipe.user_id == User.id)
        .filter(Swipe.action == "like", Swipe.target_id == user_id)
        .filter(User.id.in_(i_liked_ids))
        .all()
    )

    result = []
    for p in partners:
        their_prefs = p.get_dorm_prefs()
        score = _compat_score(my_prefs, their_prefs)
        data  = p.public()
        data["compatibility"] = score
        # Breakdown: which keys match vs differ
        answered = [k for k in _COMPAT_KEYS if my_prefs.get(k) and their_prefs.get(k)]
        data["matching_prefs"]    = [k for k in answered if my_prefs[k] == their_prefs[k]]
        data["mismatching_prefs"] = [k for k in answered if my_prefs[k] != their_prefs[k]]
        result.append(data)

    result.sort(key=lambda x: x["compatibility"], reverse=True)
    return jsonify(result)
