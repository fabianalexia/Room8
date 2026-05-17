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


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _cloudinary_upload(source, public_id):
    """Upload to Cloudinary. Raises Exception with a descriptive message on failure."""
    if not os.environ.get("CLOUDINARY_CLOUD_NAME"):
        raise Exception("Cloudinary is not configured (CLOUDINARY_CLOUD_NAME missing)")
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
    """
    Return (source, error_str) from either:
      - multipart/form-data  → request.files["file"] or request.files["photo"]
      - JSON body            → request.json["photo"]  (base64 data URI)
    Returns (None, error_message) when nothing usable is found.
    """
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
            return jsonify({"error": f"Cloudinary upload failed: {str(e)}"}), 500

        user.photo = result_url
        gallery = user.get_photos()
        gallery = [p for p in gallery if "/room8/profile/" not in p]
        gallery.insert(0, result_url)
        user.photos = json.dumps(gallery)

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Database error: {str(e)}"}), 500

        return jsonify({"ok": True, "user": user.public()})

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
