"""Sign in with Apple: verify identity token, create or match the account."""
import os
import tempfile
import time
from unittest import mock

_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_db.name}")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("FLASK_ENV", "testing")

import jwt  # noqa: E402
import pytest  # noqa: E402
from cryptography.hazmat.primitives.asymmetric import rsa  # noqa: E402
from app import app  # noqa: E402
from extensions import limiter  # noqa: E402
from room8_models import db  # noqa: E402
from room8_models.user import User  # noqa: E402

limiter.enabled = False
KEY = rsa.generate_private_key(public_exponent=65537, key_size=2048)


@pytest.fixture(autouse=True)
def clean():
    with app.app_context():
        db.drop_all(); db.create_all()
    yield


def apple_token(sub="001.abc", email="stu@privaterelay.appleid.com", aud="com.swiperoom8.app", iss="https://appleid.apple.com"):
    claims = {"sub": sub, "aud": aud, "iss": iss, "iat": int(time.time()), "exp": int(time.time()) + 600}
    if email:
        claims["email"] = email
    return jwt.encode(claims, KEY, algorithm="RS256", headers={"kid": "k1"})


def post(c, token, **extra):
    fake = mock.Mock(); fake.key = KEY.public_key()
    with mock.patch("jwt.PyJWKClient") as client:
        client.return_value.get_signing_key_from_jwt.return_value = fake
        return c.post("/api/auth/apple", json={"identity_token": token, **extra})


def test_first_sign_in_creates_account_with_name():
    c = app.test_client()
    r = post(c, apple_token(), first_name="Stu", last_name="Dent")
    body = r.get_json()
    assert r.status_code == 200 and body["access_token"] and body["user"]["first_name"] == "Stu"


def test_later_sign_in_without_email_matches_by_apple_id():
    c = app.test_client()
    post(c, apple_token())
    r = post(c, apple_token(email=None))
    assert r.status_code == 200 and r.get_json()["user"]["email"] == "stu@privaterelay.appleid.com"
    with app.app_context():
        assert User.query.count() == 1


def test_links_existing_email_account():
    with app.app_context():
        db.session.add(User(email="me@whitman.edu")); db.session.commit()
    r = post(app.test_client(), apple_token(email="me@whitman.edu"))
    assert r.get_json()["user"]["email"] == "me@whitman.edu"


def test_rejects_wrong_audience_and_issuer():
    c = app.test_client()
    assert post(c, apple_token(aud="com.someone.else")).status_code == 401
    assert post(c, apple_token(iss="https://evil.example")).status_code == 401
