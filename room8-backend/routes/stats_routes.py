# routes/stats_routes.py: public, non-identifying signup numbers for the homepage counter
from datetime import datetime, timezone

from flask import Blueprint, jsonify

from room8_models import db
from room8_models.user import User

stats_bp = Blueprint("stats", __name__, url_prefix="/api/stats")


@stats_bp.get("/public")
def public_stats():
    """Counts only verified students with a confirmed email. Returns totals, never names."""
    base = (
        User.query
        .filter(User.is_verified_student == True)   # noqa: E712
        .filter(User.email_verified == True)        # noqa: E712
    )
    students = base.count()
    schools = (
        db.session.query(db.func.count(db.distinct(User.school)))
        .filter(User.is_verified_student == True)   # noqa: E712
        .filter(User.email_verified == True)        # noqa: E712
        .filter(User.school.isnot(None))
        .filter(User.school != "")
        .scalar()
    ) or 0
    resp = jsonify({
        "verified_students": students,
        "schools": schools,
        "updated_at": datetime.now(timezone.utc).date().isoformat(),
    })
    resp.headers["Cache-Control"] = "public, max-age=300"
    return resp
