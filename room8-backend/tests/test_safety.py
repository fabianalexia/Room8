"""App Store safety: terms acceptance, content filter, bans, blocks hide likes."""
import os
import tempfile
from unittest import mock

_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_db.name}")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("FLASK_ENV", "testing")

import pytest  # noqa: E402
from werkzeug.security import generate_password_hash  # noqa: E402
from flask_jwt_extended import create_access_token  # noqa: E402
from app import app  # noqa: E402
from extensions import limiter  # noqa: E402
from room8_models import db  # noqa: E402
from room8_models.user import User  # noqa: E402
from room8_models.swipe import Swipe  # noqa: E402
from moderation import is_objectionable  # noqa: E402

limiter.enabled = False


@pytest.fixture(autouse=True)
def clean():
    with app.app_context():
        db.drop_all(); db.create_all()
    yield


@pytest.fixture
def c():
    return app.test_client()


def mk(email, **kw):
    with app.app_context():
        u = User(email=email, first_name=email[0], password_hash=generate_password_hash("password1"),
                 email_verified=True, profile_complete=True, **kw)
        db.session.add(u); db.session.commit()
        return u.id


def h(uid):
    with app.app_context():
        return {"Authorization": f"Bearer {create_access_token(identity=str(uid))}"}


def like(a, b):
    with app.app_context():
        db.session.add(Swipe(user_id=a, target_id=b, action="like")); db.session.commit()


def test_filter_catches_slurs_and_threats_not_normal_talk():
    assert is_objectionable("you're a f4ggot")
    assert is_objectionable("just kill yourself")
    assert not is_objectionable("this damn dorm is so loud lol")
    assert not is_objectionable("I'm skilled at cooking, will kill it at potlucks")


def test_register_records_terms_and_accept_endpoint(c):
    with mock.patch("routes.auth_routes._send_verification_email"):
        r = c.post("/api/auth/register", json={"email": "n@x.edu", "password": "password1", "agreed_to_terms": True})
    assert r.get_json()["user"]["terms_accepted"] is True
    uid = mk("o@x.edu")
    assert c.get("/api/auth/me", headers=h(uid)).get_json()["user"]["terms_accepted"] is False
    assert c.post("/api/auth/accept-terms", headers=h(uid)).get_json()["user"]["terms_accepted"] is True


def test_objectionable_message_rejected(c):
    a, b = mk("a@x.edu"), mk("b@x.edu")
    like(a, b); like(b, a)
    bad = c.post(f"/api/chat/{b}", json={"text": "kys"}, headers=h(a))
    assert bad.status_code == 400
    ok = c.post(f"/api/chat/{b}", json={"text": "hey! want to room together?"}, headers=h(a))
    assert ok.status_code in (200, 201)


def test_banned_user_locked_out_and_hidden(c, monkeypatch):
    monkeypatch.setenv("SCHOOL_GATE_ENABLED", "false")
    with mock.patch.dict(os.environ, {"ADMIN_EMAILS": "admin@x.edu"}):
        admin, bad, other = mk("admin@x.edu"), mk("bad@x.edu"), mk("other@x.edu")
        r = c.post(f"/api/admin/users/{bad}/ban", headers=h(admin))
        assert r.get_json()["is_banned"] is True
    assert c.get("/api/auth/me", headers=h(bad)).status_code == 401
    assert c.post("/api/auth/login", json={"email": "bad@x.edu", "password": "password1"}).status_code == 403
    ids = [u["id"] for u in c.get(f"/api/candidates/{other}", headers=h(other)).get_json()]
    assert bad not in ids and admin in ids


def test_blocked_user_disappears_from_likes(c):
    me, fan = mk("me@x.edu"), mk("fan@x.edu")
    like(fan, me)
    assert [u["id"] for u in c.get(f"/api/likes/{me}", headers=h(me)).get_json()] == [fan]
    c.post("/api/block", json={"blocked_id": fan}, headers=h(me))
    assert c.get(f"/api/likes/{me}", headers=h(me)).get_json() == []


def test_report_emails_admins(c):
    a, b = mk("a@x.edu"), mk("b@x.edu")
    with mock.patch.dict(os.environ, {"ADMIN_EMAILS": "boss@x.edu"}), \
         mock.patch("mailer.send_email") as send:
        c.post("/api/report", json={"reported_id": b, "reason": "harassment"}, headers=h(a))
    assert send.call_args.args[0] == ["boss@x.edu"]
