from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from room8_models import db
from room8_models.report import Report
from room8_models.swipe import Swipe
from utils import sanitize

report_bp = Blueprint("report", __name__, url_prefix="/api/report")


@report_bp.post("")
@jwt_required()
def submit_report():
    reporter_id = int(get_jwt_identity())
    data        = request.get_json(force=True) or {}
    reported_id = data.get("reported_id")
    reason      = sanitize(data.get("reason", "inappropriate"))
    notes       = sanitize(data.get("notes", ""))

    if not reported_id:
        return jsonify({"error": "reported_id required"}), 400

    # Record the report
    db.session.add(Report(
        reporter_id=reporter_id,
        reported_id=reported_id,
        reason=reason,
        notes=notes,
    ))

    # Block = record as skip so reported user no longer appears in candidates
    existing = Swipe.query.filter_by(user_id=reporter_id, target_id=reported_id).first()
    if existing:
        existing.action = "skip"
    else:
        db.session.add(Swipe(user_id=reporter_id, target_id=reported_id, action="skip"))

    db.session.commit()
    _notify_admins(reporter_id, reported_id, reason, notes)
    return jsonify({"ok": True}), 201


def _notify_admins(reporter_id, reported_id, reason, notes):
    """Email admins so reports get handled within 24 hours (App Store rule)."""
    try:
        from admin_auth import admin_emails
        from mailer import send_email
        to = sorted(admin_emails())
        if not to:
            return
        send_email(
            to,
            f"Room8 report: user {reported_id} ({reason})",
            f"<p>User {reporter_id} reported user {reported_id}.</p>"
            f"<p><b>Reason:</b> {reason}<br><b>Notes:</b> {notes or 'none'}</p>"
            f"<p>Review it at <a href='https://swiperoom8.com/admin'>swiperoom8.com/admin</a> within 24 hours.</p>",
        )
    except Exception as e:
        print(f"[report] admin email failed: {e}")
