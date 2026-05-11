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
    reporter_id = get_jwt_identity()
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
    return jsonify({"ok": True}), 201
