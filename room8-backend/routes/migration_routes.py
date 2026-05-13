# ONE-TIME MIGRATION — delete this file and its registration in app.py after use.
from flask import Blueprint, jsonify
from room8_models import db

migration_bp = Blueprint("migration", __name__, url_prefix="/api/migration")


@migration_bp.post("/verify-all")
def verify_all():
    db.session.execute(
        db.text("UPDATE users SET email_verified = true, profile_complete = true")
    )
    db.session.commit()
    return jsonify({"ok": True})
