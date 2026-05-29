import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from room8_models import db
from room8_models.push_subscription import PushSubscription

push_bp = Blueprint("push", __name__, url_prefix="/api/push")


@push_bp.route("/subscribe", methods=["POST"])
@jwt_required()
def subscribe():
    user_id = int(get_jwt_identity())
    data = request.get_json(force=True) or {}

    # Expect the full PushSubscription JSON from the browser:
    # { endpoint: "...", keys: { p256dh: "...", auth: "..." } }
    endpoint = data.get("endpoint")
    if not endpoint:
        return jsonify({"error": "subscription endpoint required"}), 400

    sub_json = json.dumps(data)

    existing = PushSubscription.query.filter_by(user_id=user_id).first()
    if existing:
        existing.subscription_json = sub_json
    else:
        db.session.add(PushSubscription(user_id=user_id, subscription_json=sub_json))

    db.session.commit()
    return jsonify({"ok": True}), 200


@push_bp.route("/unsubscribe", methods=["DELETE"])
@jwt_required()
def unsubscribe():
    user_id = int(get_jwt_identity())
    sub = PushSubscription.query.filter_by(user_id=user_id).first()
    if sub:
        db.session.delete(sub)
        db.session.commit()
    return jsonify({"ok": True}), 200
