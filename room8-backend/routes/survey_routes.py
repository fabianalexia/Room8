import json
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from room8_models import db
from room8_models.survey import Survey
from utils import sanitize

survey_bp = Blueprint("survey", __name__, url_prefix="/api")


@survey_bp.route("/survey", methods=["POST"])
@jwt_required()
def save_survey():
    user_id = int(get_jwt_identity())
    data    = request.get_json(force=True) or {}
    answers = data.get("answers")

    if not answers:
        return jsonify({"error": "answers required"}), 400

    # Sanitize all string values in the answers dict to prevent XSS
    clean_answers = {
        k: (sanitize(v) if isinstance(v, str) else v)
        for k, v in answers.items()
    }

    existing = Survey.query.filter_by(user_id=user_id).first()
    if existing:
        existing.answers = json.dumps(clean_answers)
    else:
        db.session.add(Survey(user_id=user_id, answers=json.dumps(clean_answers)))

    db.session.commit()
    return jsonify({"ok": True}), 201
