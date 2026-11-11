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


# ── Native app device tokens ─────────────────────────────────────────────────

@push_bp.route("/device", methods=["POST"])
@jwt_required()
def register_device():
    from room8_models.device_token import DeviceToken
    user_id = int(get_jwt_identity())
    data = request.get_json(silent=True) or {}
    token = (data.get("token") or "").strip()
    platform = data.get("platform")
    if not token or platform not in ("ios", "android") or len(token) > 512:
        return jsonify({"error": "token and platform (ios|android) required"}), 400
    row = DeviceToken.query.filter_by(token=token).first()
    if row:
        row.user_id, row.platform = user_id, platform   # device switched accounts
    else:
        db.session.add(DeviceToken(user_id=user_id, token=token, platform=platform))
    db.session.commit()
    return jsonify({"ok": True})


@push_bp.route("/device", methods=["DELETE"])
@jwt_required()
def unregister_device():
    from room8_models.device_token import DeviceToken
    user_id = int(get_jwt_identity())
    token = ((request.get_json(silent=True) or {}).get("token") or "").strip()
    q = DeviceToken.query.filter_by(user_id=user_id)
    if token:
        q = q.filter_by(token=token)
    q.delete(synchronize_session=False)
    db.session.commit()
    return jsonify({"ok": True})
