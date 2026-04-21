import json
from flask import Blueprint, request, jsonify
from room8_models import db
from room8_models.survey import Survey

survey_bp = Blueprint("survey", __name__, url_prefix="/api")


@survey_bp.route("/survey", methods=["POST"])
def save_survey():
    data = request.get_json(force=True) or {}
    user_id = data.get("user_id")
    answers = data.get("answers")

    if not user_id or not answers:
        return jsonify({"error": "user_id and answers required"}), 400

    existing = Survey.query.filter_by(user_id=user_id).first()
    if existing:
        existing.answers = json.dumps(answers)
    else:
        db.session.add(Survey(user_id=user_id, answers=json.dumps(answers)))

    db.session.commit()
    return jsonify({"ok": True}), 201
