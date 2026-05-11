from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from room8_models import db
from room8_models.swipe import Swipe

match_bp = Blueprint("match", __name__, url_prefix="/api")


@match_bp.delete("/match/<int:peer_id>")
@jwt_required()
def unmatch(peer_id):
    user_id = get_jwt_identity()

    # Break the match: flip both swipe directions to "skip"
    for uid, tid in [(user_id, peer_id), (peer_id, user_id)]:
        swipe = Swipe.query.filter_by(user_id=uid, target_id=tid).first()
        if swipe:
            swipe.action = "skip"
        else:
            db.session.add(Swipe(user_id=uid, target_id=tid, action="skip"))

    db.session.commit()
    return jsonify({"message": "Unmatched"}), 200
