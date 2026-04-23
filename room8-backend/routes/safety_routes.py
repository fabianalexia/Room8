from flask import Blueprint, request, jsonify
from room8_models import db
from room8_models.block import Block
from room8_models.swipe import Swipe

safety_bp = Blueprint("safety", __name__, url_prefix="/api")


@safety_bp.post("/block")
def block_user():
    data       = request.get_json(force=True) or {}
    blocker_id = data.get("blocker_id")
    blocked_id = data.get("blocked_id")

    if not blocker_id or not blocked_id:
        return jsonify({"error": "blocker_id and blocked_id required"}), 400

    # Upsert block record
    if not Block.query.filter_by(blocker_id=blocker_id, blocked_id=blocked_id).first():
        db.session.add(Block(blocker_id=blocker_id, blocked_id=blocked_id))

    # Record as skip so blocked user won't surface in candidates
    existing_swipe = Swipe.query.filter_by(user_id=blocker_id, target_id=blocked_id).first()
    if existing_swipe:
        existing_swipe.action = "skip"
    else:
        db.session.add(Swipe(user_id=blocker_id, target_id=blocked_id, action="skip"))

    db.session.commit()
    return jsonify({"message": "User blocked"}), 201
