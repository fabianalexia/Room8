from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from room8_models import db
from room8_models.swipe import Swipe

match_bp = Blueprint("match", __name__, url_prefix="/api")


@match_bp.delete("/match/<int:peer_id>")
@jwt_required()
def unmatch(peer_id):
    user_id = int(get_jwt_identity())

    # Verify a real mutual match exists before touching anything
    my_like   = Swipe.query.filter_by(user_id=user_id, target_id=peer_id, action="like").first()
    peer_like = Swipe.query.filter_by(user_id=peer_id, target_id=user_id, action="like").first()

    if not my_like or not peer_like:
        return jsonify({"error": "No match exists between these users"}), 403

    # Flip my swipe unconditionally (we know it exists as "like")
    my_like.action = "skip"

    # Flip peer's swipe only if it exists as "like" (it must — we just checked)
    peer_like.action = "skip"

    db.session.commit()
    return jsonify({"message": "Unmatched"}), 200
