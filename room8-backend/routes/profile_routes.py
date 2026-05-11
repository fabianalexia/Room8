import json
import uuid
import cloudinary
import cloudinary.uploader
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from room8_models import db
from room8_models.user import User
from room8_models.swipe import Swipe
from room8_models.block import Block
from utils import sanitize

profile_bp = Blueprint("profile", __name__, url_prefix="/api/profile")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}
MAX_BIO_LEN        = 500
MAX_LOOKING_FOR_LEN = 500


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

    # Sanitize and enforce length limits on free-text fields
    try:
        if "bio" in data:
            user.bio = sanitize(data["bio"], max_len=MAX_BIO_LEN)
        if "looking_for" in data:
            user.looking_for = sanitize(data["looking_for"], max_len=MAX_LOOKING_FOR_LEN)
        if "budget" in data:
            user.budget = sanitize(data["budget"])
        if "location" in data:
            user.location = sanitize(data["location"])
        if "first_name" in data:
            user.first_name = sanitize(data["first_name"])
        if "last_name" in data:
            user.last_name = sanitize(data["last_name"])
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    if "age" in data and data["age"]:
        try:
            age = int(data["age"])
            if not (16 <= age <= 99):
                return jsonify({"error": "Age must be between 16 and 99"}), 400
            user.age = age
        except ValueError:
            pass

    for field in ("school", "class_year", "major", "housing_type", "room_type"):
        if field in data:
            setattr(user, field, sanitize(data[field]))

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
    viewer_id = get_jwt_identity()
    is_match  = False

    # Own profile is always accessible
    if viewer_id != user_id:
        # Allow if there is a mutual match
        my_like   = Swipe.query.filter_by(user_id=viewer_id, target_id=user_id, action="like").first()
        peer_like = Swipe.query.filter_by(user_id=user_id, target_id=viewer_id, action="like").first()
        is_match  = bool(my_like and peer_like)

        # Allow if the target appears in viewer's candidate pool (viewer has not yet swiped them)
        already_swiped = Swipe.query.filter_by(user_id=viewer_id, target_id=user_id).first()
        is_candidate   = not already_swiped

        # Block check — blocked users may not view each other
        blocked = Block.query.filter(
            ((Block.blocker_id == viewer_id) & (Block.blocked_id == user_id))
            | ((Block.blocker_id == user_id) & (Block.blocked_id == viewer_id))
        ).first()

        if blocked or (not is_match and not is_candidate):
            return _forbidden()

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Return full profile (with email) for own profile or mutual matches;
    # candidates see a card view without email.
    if viewer_id == user_id or is_match:
        return jsonify(user.public())
    return jsonify(user.public_card())


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
