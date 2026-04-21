import os
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
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

    upload_dir = os.path.join(current_app.root_path, "uploads")
    os.makedirs(upload_dir, exist_ok=True)

    ext = secure_filename(file.filename).rsplit(".", 1)[-1]
    filename = f"user_{user_id}.{ext}"
    file.save(os.path.join(upload_dir, filename))

    base = request.url_root.rstrip("/")
    user.photo = f"{base}/uploads/{filename}"
    db.session.commit()

    return jsonify({"ok": True, "user": user.public()})
