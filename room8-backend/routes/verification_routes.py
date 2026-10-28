# Photo verification (Option B: selfie with a random pose, reviewed by an admin)
import secrets
import uuid
from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import limiter
from room8_models import db
from room8_models.user import User
from room8_models.photo_verification import PhotoVerification

verify_bp = Blueprint("verify", __name__, url_prefix="/api/verify")

# pose_code -> instruction shown to the user and to the reviewer
POSES = {
    "peace_sign":   "Hold up a peace sign next to your face",
    "thumbs_up":    "Give a thumbs up next to your face",
    "three_fingers": "Hold up three fingers next to your face",
    "hand_on_head": "Put one hand on top of your head",
    "point_up":     "Point up with one finger next to your face",
    "wave":         "Wave with an open palm next to your face",
}

ALLOWED_EXT = {"png", "jpg", "jpeg", "webp", "heic"}


def _latest(user_id):
    return (
        PhotoVerification.query
        .filter_by(user_id=user_id)
        .order_by(PhotoVerification.id.desc())
        .first()
    )


def _serialize(v, user):
    if not v:
        return {"status": "approved" if user.is_photo_verified else "none",
                "is_photo_verified": bool(user.is_photo_verified)}
    return {
        "id":                v.id,
        "status":            v.status,
        "pose_code":         v.pose_code,
        "pose":              POSES.get(v.pose_code, ""),
        "reject_reason":     v.reject_reason,
        "is_photo_verified": bool(user.is_photo_verified),
    }


@verify_bp.get("/photo/status")
@jwt_required()
def photo_status():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(_serialize(_latest(user.id), user))


@verify_bp.post("/photo/start")
@jwt_required()
@limiter.limit("10 per hour")
def photo_start():
    """Assign a random pose. Requires explicit consent to taking a verification selfie."""
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.is_photo_verified:
        return jsonify({"error": "Already photo verified"}), 400
    if not user.photo:
        return jsonify({"error": "Add a profile photo before verifying"}), 400

    data = request.get_json(silent=True) or {}
    if data.get("consent") is not True:
        return jsonify({"error": "Consent is required"}), 400

    latest = _latest(user.id)
    if latest and latest.status == "pending":
        return jsonify({"error": "You already have a verification under review"}), 400

    # Reuse an unfinished attempt instead of piling up rows
    if latest and latest.status == "awaiting_selfie":
        v = latest
        v.pose_code = secrets.choice(list(POSES))
    else:
        v = PhotoVerification(user_id=user.id, pose_code=secrets.choice(list(POSES)))
        db.session.add(v)
    v.consent_at = datetime.utcnow()
    db.session.commit()
    return jsonify(_serialize(v, user)), 201


@verify_bp.post("/photo/submit")
@jwt_required()
@limiter.limit("10 per hour")
def photo_submit():
    import cloudinary.uploader
    from routes.photo_routes import _init_cloudinary

    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404

    v = _latest(user.id)
    if not v or v.status != "awaiting_selfie":
        return jsonify({"error": "Start verification first"}), 400

    f = request.files.get("selfie")
    if not f or not f.filename:
        return jsonify({"error": "selfie file required"}), 400
    if "." not in f.filename or f.filename.rsplit(".", 1)[1].lower() not in ALLOWED_EXT:
        return jsonify({"error": "File type not allowed"}), 400

    try:
        _init_cloudinary()
        # "authenticated" delivery type: the image is NOT publicly reachable;
        # reviewers get a short-lived signed URL instead.
        result = cloudinary.uploader.upload(
            f.stream,
            public_id=f"room8/verify/{user.id}/{uuid.uuid4().hex[:10]}",
            type="authenticated",
            resource_type="image",
        )
    except Exception as e:
        print(f"[verify] selfie upload failed for user {user.id}: {e}")
        return jsonify({"error": "Upload failed, please try again"}), 502

    v.selfie_public_id = result["public_id"]
    v.status = "pending"
    v.submitted_at = datetime.utcnow()
    db.session.commit()
    return jsonify(_serialize(v, user))


def delete_selfie(v: PhotoVerification) -> None:
    """Best-effort removal of the selfie from Cloudinary."""
    if not v.selfie_public_id:
        return
    try:
        import cloudinary.uploader
        from routes.photo_routes import _init_cloudinary
        _init_cloudinary()
        cloudinary.uploader.destroy(v.selfie_public_id, type="authenticated", invalidate=True)
    except Exception as e:
        print(f"[verify] selfie delete failed for {v.selfie_public_id}: {e}")
    v.selfie_public_id = None
