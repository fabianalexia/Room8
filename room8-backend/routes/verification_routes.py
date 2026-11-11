# Photo verification (Option B: selfie with a random pose, reviewed by an admin)
import re
import secrets
import uuid
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import limiter
from room8_models import db
from room8_models.user import User
from room8_models.photo_verification import PhotoVerification
from werkzeug.security import generate_password_hash, check_password_hash

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


# ── .edu verification by emailed 6-digit code ─────────────────────────────────

EDU_RE = re.compile(r"^[^@\s]+@([a-z0-9-]+\.)+edu$")
CODE_TTL = timedelta(minutes=15)
MAX_ATTEMPTS = 5


def _code_email(code: str, first_name: str | None) -> str:
    return f"""
    <div style="font-family:Arial,sans-serif;max-width:420px">
      <p>Hi {first_name or 'there'},</p>
      <p>Your Room8 student verification code is:</p>
      <p style="font-size:32px;font-weight:800;letter-spacing:8px;margin:16px 0">{code}</p>
      <p>It expires in 15 minutes. If you didn't request this, you can ignore this email.</p>
    </div>
    """


@verify_bp.post("/edu/send")
@jwt_required()
@limiter.limit("5 per hour")
def edu_send():
    from mailer import send_email

    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404

    email = ((request.get_json(silent=True) or {}).get("email") or "").strip().lower()
    if not EDU_RE.match(email):
        return jsonify({"error": "Enter your school email ending in .edu"}), 400

    taken = User.query.filter(User.edu_email == email, User.edu_verified == True, User.id != user.id).first()  # noqa: E712
    if taken:
        return jsonify({"error": "That school email is already verified on another account"}), 400

    code = f"{secrets.randbelow(1_000_000):06d}"
    user.edu_email = email
    user.edu_code_hash = generate_password_hash(code)
    user.edu_code_expiry = datetime.utcnow() + CODE_TTL
    user.edu_code_attempts = 0
    db.session.commit()

    try:
        send_email(email, f"{code} is your Room8 verification code", _code_email(code, user.first_name))
    except Exception as e:
        print(f"[edu_send] email failed for user {user.id}: {e}")
        return jsonify({"error": "We couldn't send the code. Try again in a minute."}), 502
    return jsonify({"ok": True, "sent_to": email})


@verify_bp.post("/edu/confirm")
@jwt_required()
@limiter.limit("20 per hour")
def edu_confirm():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404

    code = str((request.get_json(silent=True) or {}).get("code") or "").strip()
    if not user.edu_code_hash or not user.edu_code_expiry:
        return jsonify({"error": "Request a new code first"}), 400
    if datetime.utcnow() > user.edu_code_expiry:
        return jsonify({"error": "That code expired. Send a new one."}), 400
    if user.edu_code_attempts >= MAX_ATTEMPTS:
        return jsonify({"error": "Too many tries. Send a new code."}), 400

    if not check_password_hash(user.edu_code_hash, code):
        user.edu_code_attempts += 1
        db.session.commit()
        left = MAX_ATTEMPTS - user.edu_code_attempts
        return jsonify({"error": f"Wrong code. {left} tries left." if left else "Too many tries. Send a new code."}), 400

    user.edu_verified = True
    user.is_verified_student = True
    if user.email and user.email.lower() == (user.edu_email or "").lower():
        user.email_verified = True
    user.edu_code_hash = None
    user.edu_code_expiry = None
    user.edu_code_attempts = 0
    db.session.commit()

    try:
        from school_gate import maybe_unlock
        if user.school:
            maybe_unlock(user.school)
    except Exception as e:
        print(f"[edu_confirm] unlock check failed: {e}")

    return jsonify({"ok": True, "user": user.public()})
