"""Native app OAuth handoff: callback -> one-time code -> /app-exchange -> JWT."""
import os
import tempfile
from unittest import mock

_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_db.name}")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("FLASK_ENV", "testing")

import pytest  # noqa: E402
from app import app  # noqa: E402
from extensions import limiter  # noqa: E402
from room8_models import db  # noqa: E402
from routes import auth_routes  # noqa: E402

limiter.enabled = False


@pytest.fixture(autouse=True)
def clean():
    with app.app_context():
        db.drop_all(); db.create_all()
    yield


def _fake_google():
    sess = mock.Mock()
    sess.fetch_token.return_value = {}
    sess.get.return_value.json.return_value = {"email": "Stu@Whitman.edu", "given_name": "Stu", "family_name": "Dent"}
    sess.authorization_url.return_value = ("https://accounts.google.com/x", "st")
    return sess


def _run(client, app_flag):
    with mock.patch.object(auth_routes, "GOOGLE_CLIENT_ID", "id"), \
         mock.patch.object(auth_routes, "OAuth2Session", return_value=_fake_google()):
        client.get("/api/auth/google" + ("?app=1" if app_flag else ""))
        return client.get("/api/auth/google/callback?code=abc&state=st")


def test_web_flow_still_returns_token_to_website():
    c = app.test_client()
    r = _run(c, False)
    assert r.status_code == 302 and r.location.startswith("https://swiperoom8.com/auth/callback?token=")


def test_app_flow_returns_one_time_code_and_exchanges_once():
    c = app.test_client()
    r = _run(c, True)
    assert r.location.startswith("com.swiperoom8.app://auth/callback?code=")
    code = r.location.split("code=")[1]
    ok = c.post("/api/auth/app-exchange", json={"code": code})
    body = ok.get_json()
    assert ok.status_code == 200 and body["access_token"] and body["user"]["email"] == "stu@whitman.edu"
    again = c.post("/api/auth/app-exchange", json={"code": code})
    assert again.status_code == 400  # single use


def test_app_flag_does_not_leak_into_next_web_login():
    c = app.test_client()
    _run(c, True)
    r = _run(c, False)
    assert r.location.startswith("https://swiperoom8.com/auth/callback?token=")


def test_bad_code_rejected():
    c = app.test_client()
    assert c.post("/api/auth/app-exchange", json={"code": "nope"}).status_code == 400
