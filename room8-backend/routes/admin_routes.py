# Admin panel API: photo verification review, school unlock controls, reports
from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from admin_auth import admin_required, is_admin
from room8_models import db
from room8_models.user import User
from room8_models.school import School
from room8_models.report import Report
from room8_models.photo_verification import PhotoVerification
from routes.verification_routes import POSES, delete_selfie
from school_gate import verified_count, unlock, default_threshold
from utils import sanitize, send_push_notification

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


@admin_bp.get("/me")
@jwt_required()
def admin_me():
    user = db.session.get(User, int(get_jwt_identity()))
    return jsonify({"is_admin": is_admin(user)})


# ── Photo verifications ───────────────────────────────────────────────────────

def _signed_url(public_id):
    try:
        import cloudinary.utils
        from routes.photo_routes import _init_cloudinary
        _init_cloudinary()
        url, _ = cloudinary.utils.cloudinary_url(
            public_id, type="authenticated", sign_url=True, secure=True, resource_type="image",
        )
        return url
    except Exception as e:
        print(f"[admin] signed url failed: {e}")
        return None


@admin_bp.get("/verifications")
@admin_required
def list_verifications(admin):
    status = request.args.get("status", "pending")
    rows = (
        PhotoVerification.query.filter_by(status=status)
        .order_by(PhotoVerification.submitted_at.asc())
        .limit(100).all()
    )
    out = []
    for v in rows:
        u = db.session.get(User, v.user_id)
        if not u:
            continue
        out.append({
            "id":           v.id,
            "status":       v.status,
            "pose":         POSES.get(v.pose_code, v.pose_code),
            "submitted_at": v.submitted_at.isoformat() if v.submitted_at else None,
            "selfie_url":   _signed_url(v.selfie_public_id) if v.selfie_public_id else None,
            "user": {
                "id":     u.id,
                "name":   f"{u.first_name or ''} {u.last_name or ''}".strip() or u.email,
                "email":  u.email,
                "school": u.school,
                "photos": u.get_photos() or ([u.photo] if u.photo else []),
            },
        })
    return jsonify(out)


def _review(v_id, approve, admin, reason=None):
    v = db.session.get(PhotoVerification, v_id)
    if not v or v.status != "pending":
        return jsonify({"error": "Verification not pending"}), 404
    user = db.session.get(User, v.user_id)

    v.status      = "approved" if approve else "rejected"
    v.reviewed_at = datetime.utcnow()
    v.reviewed_by = admin.id
    v.reject_reason = None if approve else (reason or "Photo did not match")
    delete_selfie(v)  # never keep the selfie after review

    if approve and user:
        user.is_photo_verified = True
        user.photo_verified_at = datetime.utcnow()
    db.session.commit()

    if user:
        try:
            if approve:
                send_push_notification(user.id, "You're photo verified!", "Your blue check is now on your profile.", "/profile")
            else:
                send_push_notification(user.id, "Photo verification not approved", v.reject_reason, "/verify/photo")
        except Exception as e:
            print(f"[admin] push failed: {e}")
    return jsonify({"ok": True, "status": v.status})


@admin_bp.post("/verifications/<int:v_id>/approve")
@admin_required
def approve_verification(v_id, admin):
    return _review(v_id, True, admin)


@admin_bp.post("/verifications/<int:v_id>/reject")
@admin_required
def reject_verification(v_id, admin):
    data = request.get_json(silent=True) or {}
    return _review(v_id, False, admin, sanitize(data.get("reason"), 200))


@admin_bp.post("/users/<int:user_id>/revoke-photo-verification")
@admin_required
def revoke_photo_verification(user_id, admin):
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user.is_photo_verified = False
    user.photo_verified_at = None
    db.session.commit()
    return jsonify({"ok": True})


# ── Schools ───────────────────────────────────────────────────────────────────

@admin_bp.get("/schools")
@admin_required
def list_schools(admin):
    # Make sure every school users have picked shows up, even before anyone checks status
    names = {row[0] for row in db.session.query(User.school).filter(User.school.isnot(None)).distinct()}
    existing = {s.name for s in School.query.all()}
    for n in names - existing:
        if n:
            db.session.add(School(name=n, unlock_threshold=default_threshold()))
    db.session.commit()

    schools = School.query.order_by(School.is_unlocked.desc(), School.name.asc()).all()
    out = [s.to_dict(verified_count(s.name)) for s in schools]
    out.sort(key=lambda s: (not s["is_unlocked"], -s["verified_count"], s["name"]))
    return jsonify(out)


@admin_bp.patch("/schools/<int:school_id>")
@admin_required
def update_school(school_id, admin):
    school = db.session.get(School, school_id)
    if not school:
        return jsonify({"error": "School not found"}), 404
    data = request.get_json(silent=True) or {}

    if "unlock_threshold" in data:
        try:
            t = int(data["unlock_threshold"])
        except (TypeError, ValueError):
            return jsonify({"error": "unlock_threshold must be a number"}), 400
        if t < 1:
            return jsonify({"error": "unlock_threshold must be at least 1"}), 400
        school.unlock_threshold = t
        db.session.commit()

    if data.get("is_unlocked") is True:
        unlock(school, by="admin")
    elif data.get("is_unlocked") is False:
        school.is_unlocked = False
        school.unlocked_at = None
        school.unlocked_by = None
        db.session.commit()
    elif school and not school.is_unlocked and verified_count(school.name) >= school.unlock_threshold:
        unlock(school, by="auto")

    return jsonify(school.to_dict(verified_count(school.name)))


# ── Reports (App Store requires acting on reports quickly) ────────────────────

@admin_bp.get("/reports")
@admin_required
def list_reports(admin):
    rows = Report.query.order_by(Report.created_at.desc()).limit(200).all()
    out = []
    for r in rows:
        reporter = db.session.get(User, r.reporter_id)
        reported = db.session.get(User, r.reported_id)
        out.append({
            "id":         r.id,
            "reason":     r.reason,
            "notes":      r.notes,
            "created_at": r.created_at.isoformat(),
            "reporter":   {"id": r.reporter_id, "email": reporter.email if reporter else None},
            "reported":   {"id": r.reported_id, "email": reported.email if reported else None,
                           "name": f"{reported.first_name or ''} {reported.last_name or ''}".strip() if reported else None,
                           "photo": reported.photo if reported else None},
        })
    return jsonify(out)
