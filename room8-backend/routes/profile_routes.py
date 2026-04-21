import os
import json
import uuid
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from room8_models import db
from room8_models.user import User

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def _save_photo(app, file, user_id, unique=False):
    upload_dir = os.path.join(app.root_path, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    ext = secure_filename(file.filename).rsplit(".", 1)[-1].lower()
    if unique:
        filename = f"user_{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
    else:
        filename = f"user_{user_id}.{ext}"
    file.save(os.path.join(upload_dir, filename))
    return f"/uploads/{filename}"


@profile_bp.route("/<int:user_id>", methods=["PUT"])
def update_profile(user_id):
    from flask import current_app
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    if request.content_type and "multipart" in request.content_type:
        data = request.form
        file = request.files.get("photo")
    else:
        data = request.get_json(force=True) or {}
        file = None

    # Basic profile
    for field in ("bio", "budget", "looking_for", "location"):
        if field in data:
            setattr(user, field, data[field])

    # Name fields
    if "first_name" in data:
        user.first_name = data["first_name"]
    if "last_name" in data:
        user.last_name = data["last_name"]

    if "age" in data and data["age"]:
        try:
            user.age = int(data["age"])
        except ValueError:
            pass

    # College identity
    for field in ("school", "class_year", "major"):
        if field in data:
            setattr(user, field, data[field])

    # Housing preferences
    for field in ("housing_type", "room_type"):
        if field in data:
            setattr(user, field, data[field])

    # Lifestyle prefs — accept either JSON string or dict
    if "dorm_prefs" in data:
        raw = data["dorm_prefs"]
        if isinstance(raw, str):
            try:
                json.loads(raw)   # validate
                user.dorm_prefs = raw
            except ValueError:
                pass
        elif isinstance(raw, dict):
            user.dorm_prefs = json.dumps(raw)

    # Primary photo upload — also adds to gallery
    if file and file.filename and _allowed(file.filename):
        app_obj = current_app._get_current_object()
        path = _save_photo(app_obj, file, user_id, unique=False)
        base = request.url_root.rstrip("/")
        full_url = f"{base}{path}"
        user.photo = full_url
        # Add to photos gallery if not already present
        gallery = user.get_photos()
        if full_url not in gallery:
            gallery.insert(0, full_url)
            user.photos = json.dumps(gallery)

    db.session.commit()
    return jsonify({"ok": True, "user": user.public()})


@profile_bp.route("/<int:user_id>", methods=["GET"])
def get_profile(user_id):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user.public())


@profile_bp.route("/<int:user_id>/photos", methods=["POST"])
def add_photo(user_id):
    """Add an additional photo to the user's gallery."""
    from flask import current_app
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    file = request.files.get("photo")
    if not file or not file.filename:
        return jsonify({"error": "photo file required"}), 400
    if not _allowed(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    app_obj = current_app._get_current_object()
    path = _save_photo(app_obj, file, user_id, unique=True)
    base = request.url_root.rstrip("/")
    full_url = f"{base}{path}"

    gallery = user.get_photos()
    gallery.append(full_url)
    user.photos = json.dumps(gallery)

    # Make this the primary photo if user has none
    if not user.photo:
        user.photo = full_url

    db.session.commit()
    return jsonify({"ok": True, "user": user.public()})


@profile_bp.route("/<int:user_id>/photos", methods=["DELETE"])
def remove_photo(user_id):
    """Remove a photo URL from the user's gallery."""
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(force=True) or {}
    url = data.get("url")
    if not url:
        return jsonify({"error": "url required"}), 400

    gallery = [p for p in user.get_photos() if p != url]
    user.photos = json.dumps(gallery)

    # If removed was primary, set next in gallery or clear
    if user.photo == url:
        user.photo = gallery[0] if gallery else None

    db.session.commit()
    return jsonify({"ok": True, "user": user.public()})
