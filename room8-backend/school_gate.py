# school_gate.py — per-school unlock logic shared by routes
import os
from datetime import datetime

from room8_models import db
from room8_models.school import School
from room8_models.user import User


def gate_enabled() -> bool:
    return os.environ.get("SCHOOL_GATE_ENABLED", "false").lower() == "true"


def default_threshold() -> int:
    try:
        return max(1, int(os.environ.get("DEFAULT_UNLOCK_THRESHOLD", "50")))
    except ValueError:
        return 50


def get_or_create_school(name: str | None) -> School | None:
    if not name:
        return None
    school = School.query.filter_by(name=name).first()
    if not school:
        school = School(name=name, unlock_threshold=default_threshold())
        db.session.add(school)
        db.session.commit()
    return school


def verified_count(name: str) -> int:
    """Only verified students with a confirmed email count toward unlocking."""
    return (
        User.query
        .filter(User.school == name)
        .filter(User.is_verified_student == True)   # noqa: E712
        .filter(User.email_verified == True)        # noqa: E712
        .count()
    )


def _notify_unlocked(school: School) -> None:
    from utils import send_push_notification
    users = User.query.filter(User.school == school.name).all()
    for u in users:
        try:
            send_push_notification(
                u.id,
                f"{school.name} is live on Room8!",
                "Your school just unlocked. Start swiping for roommates.",
                "/app",
            )
        except Exception as e:  # never let a push failure break the request
            print(f"[school_gate] push failed for user {u.id}: {e}")


def unlock(school: School, by: str) -> None:
    if school.is_unlocked:
        return
    school.is_unlocked = True
    school.unlocked_at = datetime.utcnow()
    school.unlocked_by = by
    db.session.commit()
    _notify_unlocked(school)


def maybe_unlock(name: str | None) -> School | None:
    """Create the school row if needed and unlock it once the threshold is hit."""
    school = get_or_create_school(name)
    if school and not school.is_unlocked and verified_count(school.name) >= school.unlock_threshold:
        unlock(school, by="auto")
    return school


def status_for(name: str | None) -> dict:
    if not gate_enabled():
        return {"gate_enabled": False, "is_unlocked": True, "school": None}
    if not name:
        return {"gate_enabled": True, "is_unlocked": False, "school": None, "reason": "no_school"}
    school = maybe_unlock(name)
    return {
        "gate_enabled": True,
        "is_unlocked":  bool(school.is_unlocked),
        "school":       school.to_dict(verified_count(school.name)),
    }


def is_unlocked(name: str | None) -> bool:
    return status_for(name)["is_unlocked"]
