# routes/stats_routes.py: public, non-identifying signup numbers for the homepage counter
from datetime import datetime, timezone

from flask import Blueprint, jsonify

from room8_models import db
from room8_models.user import User

stats_bp = Blueprint("stats", __name__, url_prefix="/api/stats")


@stats_bp.get("/public")
def public_stats():
    """Counts only students who proved a .edu inbox. Returns totals, never names."""
    from school_gate import proven_student_filter
    base = User.query.filter(proven_student_filter())
    students = base.count()
    schools = (
        db.session.query(db.func.count(db.distinct(User.school)))
        .filter(proven_student_filter())
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
