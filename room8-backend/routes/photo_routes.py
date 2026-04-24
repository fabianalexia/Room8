import json
import cloudinary
import cloudinary.uploader
from flask import Blueprint, request, jsonify
from room8_models import db
from room8_models.user import User

photo_bp = Blueprint("photo", __name__, url_prefix="/api/profile")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _cloudinary_upload(source, public_id):
    """Upload to Cloudinary from a FileStorage object, raw bytes, or base64 data URI."""
    # FileStorage — pass the underlying stream so Cloudinary reads bytes correctly
    if hasattr(source, "stream"):
        source = source.stream
    return cloudinary.uploader.upload(
        source,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
    )


def _resolve_source(request_obj):
    """
    Return (source, error_str) from either:
      - multipart/form-data  → request.files["file"]
      - JSON body            → request.json["photo"]  (base64 data URI or URL)
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

    # JSON / base64 path
    body = request_obj.get_json(silent=True) or {}
    photo = body.get("photo") or body.get("file")
    if not photo:
        return None, "file or photo field required"
    if not isinstance(photo, str) or not photo.startswith("data:"):
        return None, "photo must be a base64 data URI (data:image/...;base64,...)"
    return photo, None


@photo_bp.route("/photo", methods=["POST"])
def upload_photo():
    # user_id comes from form field or JSON body
    user_id = request.form.get("user_id", type=int)
    if user_id is None:
        body = request.get_json(silent=True) or {}
        try:
            user_id = int(body.get("user_id", 0)) or None
        except (TypeError, ValueError):
            user_id = None

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    source, err = _resolve_source(request)
    if err:
        return jsonify({"error": err}), 400

    result = _cloudinary_upload(source, f"room8/profile/{user_id}")
    url = result["secure_url"]

    user.photo = url
    gallery = user.get_photos()
    # Replace any old primary slot entry then prepend
    gallery = [p for p in gallery if "/room8/profile/" not in p]
    gallery.insert(0, url)
    user.photos = json.dumps(gallery)

    db.session.commit()
    return jsonify({"ok": True, "user": user.public()})
