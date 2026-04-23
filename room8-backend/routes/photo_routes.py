import cloudinary
import cloudinary.uploader
from flask import Blueprint, request, jsonify
from room8_models import db
from room8_models.user import User

photo_bp = Blueprint("photo", __name__, url_prefix="/api/profile")

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}


def _allowed(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


@photo_bp.route("/photo", methods=["POST"])
def upload_photo():
    user_id = request.form.get("user_id", type=int)
    file = request.files.get("file")

    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    if not file or not file.filename:
        return jsonify({"error": "file required"}), 400
    if not _allowed(file.filename):
        return jsonify({"error": "File type not allowed"}), 400

    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    result = cloudinary.uploader.upload(
        file,
        public_id=f"room8/profile/{user_id}",
        overwrite=True,
        resource_type="image",
    )
    url = result["secure_url"]

    user.photo = url
    # Keep gallery in sync — replace old primary or prepend
    gallery = user.get_photos()
    if gallery and gallery[0] != url:
        # Remove any previous primary-slot entry for this user, then prepend
        gallery = [p for p in gallery if not p.endswith(f"/room8/profile/{user_id}")]
        gallery.insert(0, url)
        user.photos = __import__("json").dumps(gallery)
    elif not gallery:
        user.photos = __import__("json").dumps([url])

    db.session.commit()
    return jsonify({"ok": True, "user": user.public()})
