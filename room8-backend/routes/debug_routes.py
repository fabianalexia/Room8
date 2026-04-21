# routes/debug_routes.py
import json
from flask import Blueprint, jsonify
from werkzeug.security import generate_password_hash
from room8_models import db
from room8_models.user import User
from room8_models.swipe import Swipe
from room8_models.message import Message

debug_bp = Blueprint("debug", __name__, url_prefix="/api/debug")

DEMO_SCHOOL = "New York University (NYU)"


@debug_bp.post("/seed")
def seed():
    """Seed realistic demo users with full college profiles."""
    if User.query.count() == 0:
        demo = [
            dict(
                email="emma@demo.com", first_name="Emma", last_name="Chen",
                password_hash=generate_password_hash("password"),
                photo="https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=800&q=80",
                bio="Film major who loves cooking and late-night study sessions. Super clean, quiet after 10pm.",
                age=20, school=DEMO_SCHOOL, class_year="Sophomore", major="Film & TV",
                housing_type="on_campus", room_type="double", budget="$900/mo",
                dorm_prefs=json.dumps({
                    "sleep_schedule": "night_owl", "cleanliness": "clean",
                    "study_habits": "in_room", "guests": "occasionally",
                    "noise": "quiet", "social": "social",
                    "partying": "sometimes", "smoking": "no",
                }),
                looking_for="Someone chill and respectful of sleep schedule. Prefer no smoking.",
            ),
            dict(
                email="maya@demo.com", first_name="Maya", last_name="Patel",
                password_hash=generate_password_hash("password"),
                photo="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800&q=80",
                bio="Pre-med student. Early riser, very clean, loves plants. Looking for a calm living space.",
                age=21, school=DEMO_SCHOOL, class_year="Junior", major="Biology (Pre-Med)",
                housing_type="on_campus", room_type="single", budget="$1100/mo",
                dorm_prefs=json.dumps({
                    "sleep_schedule": "early_bird", "cleanliness": "very_clean",
                    "study_habits": "library", "guests": "never",
                    "noise": "silent", "social": "private",
                    "partying": "never", "smoking": "no",
                }),
                looking_for="A studious, clean roommate who respects quiet hours. Library person preferred.",
            ),
            dict(
                email="zoe@demo.com", first_name="Zoe", last_name="Martinez",
                password_hash=generate_password_hash("password"),
                photo="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=800&q=80",
                bio="Art & design student. Night owl, social, always has friends over on weekends. Fun but respectful.",
                age=22, school=DEMO_SCHOOL, class_year="Senior", major="Graphic Design",
                housing_type="off_campus", room_type="apartment", budget="$1000/mo",
                dorm_prefs=json.dumps({
                    "sleep_schedule": "night_owl", "cleanliness": "relaxed",
                    "study_habits": "anywhere", "guests": "often",
                    "noise": "moderate", "social": "very_social",
                    "partying": "often", "smoking": "no",
                }),
                looking_for="Someone social who doesn't mind a lively apartment. Creative types welcome!",
            ),
            dict(
                email="jade@demo.com", first_name="Jade", last_name="Kim",
                password_hash=generate_password_hash("password"),
                photo="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80",
                bio="CS major on a hybrid schedule. Quiet, respectful, loves hiking and cooking on weekends.",
                age=23, school=DEMO_SCHOOL, class_year="Senior", major="Computer Science",
                housing_type="either", room_type="suite", budget="$950/mo",
                dorm_prefs=json.dumps({
                    "sleep_schedule": "flexible", "cleanliness": "clean",
                    "study_habits": "in_room", "guests": "occasionally",
                    "noise": "quiet", "social": "social",
                    "partying": "never", "smoking": "no",
                }),
                looking_for="Someone clean and low-drama. I'm easy to live with and just need mutual respect.",
            ),
            dict(
                email="riley@demo.com", first_name="Riley", last_name="Thompson",
                password_hash=generate_password_hash("password"),
                photo="https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=800&q=80",
                bio="Music education major. Practice is headphones-only. Very friendly, keeps common areas tidy.",
                age=19, school=DEMO_SCHOOL, class_year="Freshman", major="Music Education",
                housing_type="on_campus", room_type="double", budget="$800/mo",
                dorm_prefs=json.dumps({
                    "sleep_schedule": "early_bird", "cleanliness": "clean",
                    "study_habits": "in_room", "guests": "occasionally",
                    "noise": "quiet", "social": "social",
                    "partying": "sometimes", "smoking": "no",
                }),
                looking_for="A friendly, clean roommate who's cool with me practicing (headphones in, promise!).",
            ),
        ]
        for d in demo:
            db.session.add(User(**d))
        db.session.commit()

    users = User.query.order_by(User.id).all()
    return jsonify({"ok": True, "count": len(users), "users": [u.public() for u in users]})


@debug_bp.post("/reset")
def reset():
    """Clear swipes and messages (keep users)."""
    Swipe.query.delete()
    Message.query.delete()
    db.session.commit()
    return jsonify({"ok": True})
