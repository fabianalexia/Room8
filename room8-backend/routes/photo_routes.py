import json
import os
import cloudinary
import cloudinary.uploader
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from room8_models import db
from room8_models.user import User

photo_bp = Blueprint("photo", __name__, url_prefix="/api/profile")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def _init_cloudinary():
    """Ensure Cloudinary is configured from env vars. Raises if credentials missing."""
    cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME")
    api_key    = os.environ.get("CLOUDINARY_API_KEY")
    api_secret = os.environ.get("CLOUDINARY_API_SECRET")

    missing = [k for k, v in {
        "CLOUDINARY_CLOUD_NAME": cloud_name,
        "CLOUDINARY_API_KEY":    api_key,
        "CLOUDINARY_API_SECRET": api_secret,
    }.items() if not v]

    if missing:
        raise Exception(f"Cloudinary env vars not set: {', '.join(missing)}")

    cloudinary.config(
        cloud_name=cloud_name,
        api_key=api_key,
        api_secret=api_secret,
    )


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _cloudinary_upload(source, public_id):
    """Upload to Cloudinary. Raises Exception with a descriptive message on failure."""
    _init_cloudinary()
    if hasattr(source, "stream"):
        source = source.stream
    result = cloudinary.uploader.upload(
        source,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
    )
    return result["secure_url"]


def _resolve_source(request_obj):
    ct = request_obj.content_type or ""
    if "multipart" in ct:
        f = request_obj.files.get("file") or request_obj.files.get("photo")
        if not f or not f.filename:
            return None, "file required"
        if not _allowed(f.filename):
            return None, "File type not allowed"
        return f, None
    body = request_obj.get_json(silent=True) or {}
    photo = body.get("photo") or body.get("file")
    if not photo:
        return None, "file or photo field required"
    if not isinstance(photo, str) or not photo.startswith("data:"):
        return None, "photo must be a base64 data URI (data:image/...;base64,...)"
    return photo, None


# ── GET /api/profile/<user_id>/photos ─────────────────────────────────────────
@photo_bp.route("/<int:user_id>/photos", methods=["GET"])
@jwt_required()
def get_photos(user_id):
    try:
        caller_id = int(get_jwt_identity())
        if caller_id != user_id:
            return jsonify({"error": "Forbidden"}), 403

        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        photos  = user.get_photos()
        primary = user.photo
        return jsonify({"ok": True, "photos": photos, "primary": primary})

    except Exception as e:
        print(f"[get_photos] ERROR user_id={user_id}: {type(e).__name__}: {e}")
        return jsonify({"error": f"get_photos failed: {type(e).__name__}: {e}"}), 500


# ── POST /api/profile/photo  (upload / replace primary photo) ─────────────────
@photo_bp.route("/photo", methods=["POST"])
@jwt_required()
def upload_photo():
    try:
        user_id = int(get_jwt_identity())

        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        source, err = _resolve_source(request)
        if err:
            return jsonify({"error": err}), 400

        try:
            result_url = _cloudinary_upload(source, f"room8/profile/{user_id}")
        except Exception as e:
            print(f"[upload_photo] Cloudinary ERROR user_id={user_id}: {type(e).__name__}: {e}")
            return jsonify({"error": f"Cloudinary upload failed: {type(e).__name__}: {e}"}), 500

        user.photo = result_url
        gallery = user.get_photos()
        gallery = [p for p in gallery if "/room8/profile/" not in p]
        gallery.insert(0, result_url)
        user.photos = json.dumps(gallery)

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            print(f"[upload_photo] DB ERROR user_id={user_id}: {type(e).__name__}: {e}")
            return jsonify({"error": f"Database error: {type(e).__name__}: {e}"}), 500

        return jsonify({"ok": True, "user": user.public()})

    except Exception as e:
        print(f"[upload_photo] UNEXPECTED ERROR: {type(e).__name__}: {e}")
        return jsonify({"error": f"Unexpected error: {type(e).__name__}: {e}"}), 500
