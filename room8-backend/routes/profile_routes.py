import json
import uuid
import traceback
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


def _init_cloudinary():
    """Configure Cloudinary from env vars. Raises with a clear message if any are missing."""
    import os as _os
    cloud_name = _os.environ.get("CLOUDINARY_CLOUD_NAME")
    api_key    = _os.environ.get("CLOUDINARY_API_KEY")
    api_secret = _os.environ.get("CLOUDINARY_API_SECRET")
    missing = [k for k, v in {
        "CLOUDINARY_CLOUD_NAME": cloud_name,
        "CLOUDINARY_API_KEY":    api_key,
        "CLOUDINARY_API_SECRET": api_secret,
    }.items() if not v]
    if missing:
        raise Exception(f"Cloudinary env vars not set: {', '.join(missing)}")
    cloudinary.config(cloud_name=cloud_name, api_key=api_key, api_secret=api_secret)


def _upload_photo(file, public_id):
    """Upload to Cloudinary. Raises Exception with a descriptive message on failure."""
    _init_cloudinary()
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
    try:
        if int(get_jwt_identity()) != user_id:
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
            photo_b64 = (
                data.get("photo")
                if isinstance(data.get("photo"), str) and (data.get("photo") or "").startswith("data:")
                else None
            )

        # Sanitize free-text fields
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
            try:
                full_url = _upload_photo(upload_source, f"room8/profile/{user_id}")
                user.photo = full_url
                gallery = user.get_photos()
                if full_url not in gallery:
                    gallery.insert(0, full_url)
                    user.photos = json.dumps(gallery)
            except Exception as e:
                return jsonify({"error": f"Photo upload failed: {str(e)}"}), 500

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Database error: {str(e)}"}), 500

        return jsonify({"ok": True, "user": user.public()})

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@profile_bp.route("/<int:user_id>", methods=["GET"])
@jwt_required()
def get_profile(user_id):
    try:
        viewer_id = int(get_jwt_identity())
        is_match  = False

        if viewer_id != user_id:
            my_like   = Swipe.query.filter_by(user_id=viewer_id, target_id=user_id, action="like").first()
            peer_like = Swipe.query.filter_by(user_id=user_id, target_id=viewer_id, action="like").first()
            is_match  = bool(my_like and peer_like)

            already_swiped = Swipe.query.filter_by(user_id=viewer_id, target_id=user_id).first()
            is_candidate   = not already_swiped

            blocked = Block.query.filter(
                ((Block.blocker_id == viewer_id) & (Block.blocked_id == user_id))
                | ((Block.blocker_id == user_id) & (Block.blocked_id == viewer_id))
            ).first()

            if blocked or (not is_match and not is_candidate):
                return _forbidden()

        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if viewer_id == user_id or is_match:
            return jsonify(user.public())
        return jsonify(user.public_card())

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@profile_bp.route("/status", methods=["GET"])
@jwt_required()
def get_profile_status():
    try:
        user_id = int(get_jwt_identity())
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404
        return jsonify({"profile_complete": bool(user.profile_complete)})
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@profile_bp.route("/complete", methods=["GET", "PATCH", "POST"])
@jwt_required()
def profile_complete():
    try:
        user_id = int(get_jwt_identity())
        user = db.session.get(User, user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if request.method == "GET":
            return jsonify({"profile_complete": bool(user.profile_complete)})

        user.profile_complete = True
        db.session.commit()
        return jsonify({"ok": True, "profile_complete": True})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@profile_bp.route("/<int:user_id>/photos", methods=["POST"])
@jwt_required()
def add_photo(user_id):
    try:
        if int(get_jwt_identity()) != user_id:
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

    except Exception as e:
        tb = traceback.format_exc()
        print(f"[add_photo] ERROR user_id={user_id}:\n{tb}")
        try:
            db.session.rollback()
        except Exception:
            pass
        return jsonify({"error": str(e), "type": type(e).__name__, "traceback": tb}), 500


@profile_bp.route("/<int:user_id>/photos", methods=["DELETE"])
@jwt_required()
def remove_photo(user_id):
    try:
        if int(get_jwt_identity()) != user_id:
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

        try:
            db.session.commit()
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": f"Database error: {str(e)}"}), 500

        return jsonify({"ok": True, "user": user.public()})

    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500
