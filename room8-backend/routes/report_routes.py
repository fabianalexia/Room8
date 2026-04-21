from flask import Blueprint, request, jsonify
from room8_models import db
from room8_models.report import Report
from room8_models.swipe import Swipe

report_bp = Blueprint("report", __name__, url_prefix="/api/report")


@report_bp.post("")
def submit_report():
    data        = request.get_json(force=True) or {}
    reporter_id = data.get("reporter_id")
    reported_id = data.get("reported_id")
    reason      = data.get("reason", "inappropriate")
    notes       = data.get("notes", "")

    if not reporter_id or not reported_id:
        return jsonify({"error": "reporter_id and reported_id required"}), 400

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
        existing.action = "skip"   # override any prior like
    else:
        db.session.add(Swipe(user_id=reporter_id, target_id=reported_id, action="skip"))

    db.session.commit()
    return jsonify({"ok": True}), 201
