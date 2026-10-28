"""Tests for the school unlock gate and photo verification flow.

Run from room8-backend/:  python -m pytest -q tests
"""
import io
import os
import tempfile
from unittest import mock

import pytest

_db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ.update({
    "DATABASE_URL": f"sqlite:///{_db_file.name}",
    "JWT_SECRET_KEY": "test-secret",
    "FLASK_ENV": "testing",
    "ADMIN_EMAILS": "admin@whitman.edu",
    "DEFAULT_UNLOCK_THRESHOLD": "3",
    "RATELIMIT_ENABLED": "false",
    "SCHOOL_GATE_ENABLED": "true",
})

from app import app  # noqa: E402
from extensions import limiter  # noqa: E402
from room8_models import db  # noqa: E402
from room8_models.user import User  # noqa: E402
from room8_models.school import School  # noqa: E402
from flask_jwt_extended import create_access_token  # noqa: E402

limiter.enabled = False
SCHOOL = "Whitman College"


@pytest.fixture(autouse=True)
def clean_db():
    with app.app_context():
        db.drop_all()
        db.create_all()
    yield


def make_user(email, school=SCHOOL, student=True, verified=True, photo="https://x/p.jpg"):
    with app.app_context():
        u = User(email=email, first_name=email.split("@")[0], school=school,
                 is_verified_student=student, email_verified=verified, photo=photo,
                 profile_complete=True)
        db.session.add(u)
        db.session.commit()
        return u.id


def auth(uid):
    with app.app_context():
        return {"Authorization": f"Bearer {create_access_token(identity=str(uid))}"}


@pytest.fixture
def client():
    return app.test_client()


# ── School gate ───────────────────────────────────────────────────────────────

def test_locked_school_shows_progress_and_empty_deck(client):
    a = make_user("a@whitman.edu")
    make_user("b@whitman.edu")
    r = client.get("/api/schools/status", headers=auth(a)).get_json()
    assert r["is_unlocked"] is False
    assert r["school"]["verified_count"] == 2
    assert r["school"]["remaining"] == 1
    assert client.get(f"/api/candidates/{a}", headers=auth(a)).get_json() == []


def test_unverified_and_community_users_do_not_count(client):
    a = make_user("a@whitman.edu")
    make_user("b@whitman.edu", verified=False)      # email not confirmed
    make_user("c@gmail.com", student=False)         # community member
    r = client.get("/api/schools/status", headers=auth(a)).get_json()
    assert r["school"]["verified_count"] == 1


def test_auto_unlock_at_threshold_and_same_school_only(client):
    a = make_user("a@whitman.edu")
    make_user("b@whitman.edu")
    make_user("c@whitman.edu")
    make_user("x@wsu.edu", school="Washington State University")
    with mock.patch("utils.send_push_notification") as push:
        r = client.get("/api/schools/status", headers=auth(a)).get_json()
        assert r["is_unlocked"] is True
        assert push.call_count == 3  # everyone at the school is notified
    cands = client.get(f"/api/candidates/{a}", headers=auth(a)).get_json()
    assert sorted(c["first_name"] for c in cands) == ["b", "c"]


def test_admin_can_unlock_and_change_threshold(client):
    admin = make_user("admin@whitman.edu")
    user = make_user("a@whitman.edu")
    schools = client.get("/api/admin/schools", headers=auth(admin)).get_json()
    sid = schools[0]["id"]
    r = client.patch(f"/api/admin/schools/{sid}", json={"unlock_threshold": 10}, headers=auth(admin)).get_json()
    assert r["unlock_threshold"] == 10 and r["is_unlocked"] is False
    r = client.patch(f"/api/admin/schools/{sid}", json={"is_unlocked": True}, headers=auth(admin)).get_json()
    assert r["is_unlocked"] is True and r["unlocked_by"] == "admin"
    assert client.get("/api/schools/status", headers=auth(user)).get_json()["is_unlocked"] is True


def test_non_admin_blocked_from_admin_api(client):
    u = make_user("a@whitman.edu")
    assert client.get("/api/admin/schools", headers=auth(u)).status_code == 403
    assert client.get("/api/admin/verifications", headers=auth(u)).status_code == 403
    assert client.get("/api/admin/me", headers=auth(u)).get_json()["is_admin"] is False


def test_old_unauthenticated_migration_route_is_gone(client):
    assert client.post("/api/migration/verify-all").status_code == 404


# ── Photo verification ────────────────────────────────────────────────────────

def _fake_upload(*args, **kwargs):
    return {"public_id": kwargs["public_id"], "secure_url": "https://x/selfie.jpg"}


def test_photo_verification_full_flow(client):
    admin = make_user("admin@whitman.edu")
    u = make_user("a@whitman.edu")

    assert client.post("/api/verify/photo/start", json={}, headers=auth(u)).status_code == 400  # no consent
    r = client.post("/api/verify/photo/start", json={"consent": True}, headers=auth(u))
    assert r.status_code == 201 and r.get_json()["pose"]

    with mock.patch("routes.photo_routes._init_cloudinary"), \
         mock.patch("cloudinary.uploader.upload", side_effect=_fake_upload):
        r = client.post("/api/verify/photo/submit", headers=auth(u),
                        data={"selfie": (io.BytesIO(b"img"), "me.jpg")},
                        content_type="multipart/form-data")
    assert r.get_json()["status"] == "pending"

    with mock.patch("routes.photo_routes._init_cloudinary"), \
         mock.patch("cloudinary.utils.cloudinary_url", return_value=("https://signed", {})):
        queue = client.get("/api/admin/verifications", headers=auth(admin)).get_json()
    assert len(queue) == 1 and queue[0]["selfie_url"] == "https://signed"

    with mock.patch("routes.photo_routes._init_cloudinary"), \
         mock.patch("cloudinary.uploader.destroy") as destroy, \
         mock.patch("routes.admin_routes.send_push_notification"):
        r = client.post(f"/api/admin/verifications/{queue[0]['id']}/approve", headers=auth(admin))
        assert r.get_json()["status"] == "approved"
        destroy.assert_called_once()  # selfie deleted right after review

    status = client.get("/api/verify/photo/status", headers=auth(u)).get_json()
    assert status["is_photo_verified"] is True
    me = client.get(f"/api/profile/{u}", headers=auth(u)).get_json()
    assert (me.get("user") or me).get("is_photo_verified") is True


def test_rejected_user_can_retry(client):
    admin = make_user("admin@whitman.edu")
    u = make_user("a@whitman.edu")
    client.post("/api/verify/photo/start", json={"consent": True}, headers=auth(u))
    with mock.patch("routes.photo_routes._init_cloudinary"), \
         mock.patch("cloudinary.uploader.upload", side_effect=_fake_upload):
        client.post("/api/verify/photo/submit", headers=auth(u),
                    data={"selfie": (io.BytesIO(b"img"), "me.jpg")}, content_type="multipart/form-data")
    with app.app_context():
        from room8_models.photo_verification import PhotoVerification
        vid = PhotoVerification.query.first().id
    with mock.patch("routes.photo_routes._init_cloudinary"), \
         mock.patch("cloudinary.uploader.destroy"), \
         mock.patch("routes.admin_routes.send_push_notification"):
        client.post(f"/api/admin/verifications/{vid}/reject", json={"reason": "Pose not shown"}, headers=auth(admin))
    s = client.get("/api/verify/photo/status", headers=auth(u)).get_json()
    assert s["status"] == "rejected" and s["reject_reason"] == "Pose not shown"
    assert client.post("/api/verify/photo/start", json={"consent": True}, headers=auth(u)).status_code == 201


def test_verification_requires_profile_photo(client):
    u = make_user("a@whitman.edu", photo=None)
    assert client.post("/api/verify/photo/start", json={"consent": True}, headers=auth(u)).status_code == 400


def test_gate_is_off_unless_enabled(client, monkeypatch):
    monkeypatch.delenv("SCHOOL_GATE_ENABLED", raising=False)
    a = make_user("a@whitman.edu")
    make_user("b@whitman.edu")
    r = client.get("/api/schools/status", headers=auth(a)).get_json()
    assert r["gate_enabled"] is False and r["is_unlocked"] is True
    assert len(client.get(f"/api/candidates/{a}", headers=auth(a)).get_json()) == 1
