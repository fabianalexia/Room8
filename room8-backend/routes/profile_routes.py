import json
import uuid
import cloudinary
import cloudinary.uploader
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from room8_models import db
from room8_models.user import User

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _upload_photo(file, public_id):
    """Upload to Cloudinary from a FileStorage object, stream, bytes, or base64 data URI."""
    source = file.stream if hasattr(file, "stream") else file
    result = cloudinary.uploader.upload(
        source,
        public_id=public_id,
        overwrite=True,
        resource_type="image",
    )
    return result["secure_url"]


def _forbidden():
    return jsonify({"error": "Forbidden"}), 403


@profile_bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_profile(user_id):
    if get_jwt_identity() != user_id:
        return _forbidden()

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.content_type and "multipart" in request.content_type:
        data = request.form
        file = request.files.get("photo")
        photo_b64 = request.form.get("photo_b64")
    else:
        data = request.get_json(force=True) or {}
        file = None
        photo_b64 = data.get("photo") if isinstance(data.get("photo"), str) and (data.get("photo") or "").startswith("data:") else None

    for field in ("bio", "budget", "looking_for", "location"):
        if field in data:
            setattr(user, field, data[field])

    if "first_name" in data:
        user.first_name = data["first_name"]
    if "last_name" in data:
        user.last_name = data["last_name"]

    if "age" in data and data["age"]:
        try:
            user.age = int(data["age"])
        except ValueError:
            pass

    for field in ("school", "class_year", "major"):
        if field in data:
            setattr(user, field, data[field])

    for field in ("housing_type", "room_type"):
        if field in data:
            setattr(user, field, data[field])

    if "dorm_prefs" in data:
        raw = data["dorm_prefs"]
        if isinstance(raw, str):
            try:
                json.loads(raw)
                user.dorm_prefs = raw
            except ValueError:
                pass
        elif isinstance(raw, dict):
            user.dorm_prefs = json.dumps(raw)

    upload_source = None
    if file and file.filename and _allowed(file.filename):
        upload_source = file
    elif photo_b64 and photo_b64.startswith("data:"):
        upload_source = photo_b64

    if upload_source is not None:
        full_url = _upload_photo(upload_source, f"room8/profile/{user_id}")
        user.photo = full_url
        gallery = user.get_photos()
        if full_url not in gallery:
            gallery.insert(0, full_url)
            user.photos = json.dumps(gallery)

    db.session.commit()
    return jsonify({"ok": True, "user": user.public()})


@profile_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_profile(user_id):
    # Any authenticated user may view a profile (needed to see match cards)
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.public())


@profile_bp.route("/status", methods=["GET"])
@jwt_required()
def get_profile_status():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"profile_complete": bool(user.profile_complete)})


@profile_bp.route("/complete", methods=["GET", "PATCH", "POST"])
@jwt_required()
def profile_complete():
    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.method == "GET":
        return jsonify({"profile_complete": bool(user.profile_complete)})

    user.profile_complete = True
    db.session.commit()
    return jsonify({"ok": True, "profile_complete": True})


@profile_bp.route("/<int:user_id>/photos", methods=["POST"])
@jwt_required()
def add_photo(user_id):
    if get_jwt_identity() != user_id:
        return _forbidden()

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    file = request.files.get("photo")
    if not file or not file.filename:
        return jsonify({"error": "photo file required"}), 400
    if not _allowed(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    uid = uuid.uuid4().hex[:8]
    full_url = _upload_photo(file, f"room8/gallery/{user_id}/{uid}")

    gallery = user.get_photos()
    gallery.append(full_url)
    user.photos = json.dumps(gallery)

    if not user.photo:
        user.photo = full_url

    db.session.commit()
    return jsonify({"ok": True, "user": user.public()})


@profile_bp.route("/<int:user_id>/photos", methods=["DELETE"])
@jwt_required()
def remove_photo(user_id):
    if get_jwt_identity() != user_id:
        return _forbidden()

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(force=True) or {}
    url = data.get("url")
    if not url:
        return jsonify({"error": "url required"}), 400

    gallery = [p for p in user.get_photos() if p != url]
    user.photos = json.dumps(gallery)

    if user.photo == url:
        user.photo = gallery[0] if gallery else None

    db.session.commit()
    return jsonify({"ok": True, "user": user.public()})
