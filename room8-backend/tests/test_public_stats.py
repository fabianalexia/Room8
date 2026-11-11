"""Public stats endpoint used by the homepage signup counter.

Run from room8-backend/:  python -m pytest -q tests
"""
import os
import tempfile

import pytest

_db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_db_file.name}")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("FLASK_ENV", "testing")
os.environ.setdefault("RATELIMIT_ENABLED", "false")

from app import app  # noqa: E402
from extensions import limiter  # noqa: E402
from room8_models import db  # noqa: E402
from room8_models.user import User  # noqa: E402

limiter.enabled = False


@pytest.fixture(autouse=True)
def clean_db():
    with app.app_context():
        db.drop_all()
        db.create_all()
    yield


def add(email, school, student=True, verified=True):
    with app.app_context():
        db.session.add(User(email=email, first_name="x", school=school,
                            is_verified_student=student, email_verified=verified))
        db.session.commit()


def test_counts_only_verified_students_and_distinct_schools():
    add("a@whitman.edu", "Whitman College")
    add("b@whitman.edu", "Whitman College")
    add("c@evergreen.edu", "Evergreen State College")
    add("d@gmail.com", "Whitman College", student=False)        # not a student
    add("e@whitman.edu", "Whitman College", verified=False)     # email not confirmed
    add("f@wsu.edu", None)                                      # no school yet

    r = app.test_client().get("/api/stats/public")
    assert r.status_code == 200
    body = r.get_json()
    assert body["verified_students"] == 4
    assert body["schools"] == 2
    assert "updated_at" in body
    assert "email" not in str(body)
