"""Native push: device registration, FCM/APNs routing, dead-token cleanup."""
import os
import tempfile
from unittest import mock

_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_db.name}")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("FLASK_ENV", "testing")

import pytest  # noqa: E402
from flask_jwt_extended import create_access_token  # noqa: E402
from app import app  # noqa: E402
from room8_models import db  # noqa: E402
from room8_models.user import User  # noqa: E402
from room8_models.device_token import DeviceToken  # noqa: E402
import native_push  # noqa: E402


@pytest.fixture(autouse=True)
def clean():
    with app.app_context():
        db.drop_all(); db.create_all()
    yield


def mk(email):
    with app.app_context():
        u = User(email=email); db.session.add(u); db.session.commit(); return u.id


def h(uid):
    with app.app_context():
        return {"Authorization": f"Bearer {create_access_token(identity=str(uid))}"}


def test_register_and_move_device_between_accounts():
    c = app.test_client()
    a, b = mk("a@x.edu"), mk("b@x.edu")
    assert c.post("/api/push/device", json={"token": "tok1", "platform": "android"}, headers=h(a)).status_code == 200
    assert c.post("/api/push/device", json={"token": "tok1", "platform": "android"}, headers=h(b)).status_code == 200
    with app.app_context():
        rows = DeviceToken.query.all()
        assert len(rows) == 1 and rows[0].user_id == b
    assert c.post("/api/push/device", json={"token": "x", "platform": "web"}, headers=h(a)).status_code == 400
    c.delete("/api/push/device", json={"token": "tok1"}, headers=h(b))
    with app.app_context():
        assert DeviceToken.query.count() == 0


def test_routes_by_platform_and_drops_dead_tokens():
    a = mk("a@x.edu")
    with app.app_context():
        db.session.add_all([DeviceToken(user_id=a, token="ios1", platform="ios"),
                            DeviceToken(user_id=a, token="and1", platform="android")])
        db.session.commit()
        with mock.patch.object(native_push, "_apns_send", return_value="ok") as ap, \
             mock.patch.object(native_push, "_fcm_send", return_value="gone") as fc:
            assert native_push.send_native_push(a, "t", "b", "/app") == 1
        assert ap.call_args.args[0] == "ios1" and fc.call_args.args[0] == "and1"
        assert [d.token for d in DeviceToken.query.all()] == ["ios1"]


def test_senders_skip_without_config(monkeypatch):
    for k in ("FIREBASE_SERVICE_ACCOUNT", "APNS_KEY_ID", "APNS_TEAM_ID", "APNS_AUTH_KEY"):
        monkeypatch.delenv(k, raising=False)
    assert native_push._fcm_send("t", "a", "b", "/") == "skip"
    assert native_push._apns_send("t", "a", "b", "/") == "skip"


def test_apns_token_signs_with_p8_key(monkeypatch):
    from cryptography.hazmat.primitives.asymmetric import ec
    from cryptography.hazmat.primitives import serialization
    import jwt
    key = ec.generate_private_key(ec.SECP256R1())
    pem = key.private_bytes(serialization.Encoding.PEM, serialization.PrivateFormat.PKCS8, serialization.NoEncryption()).decode()
    monkeypatch.setenv("APNS_KEY_ID", "KEY123"); monkeypatch.setenv("APNS_TEAM_ID", "TEAM456")
    monkeypatch.setenv("APNS_AUTH_KEY", pem.replace("\n", "\\n"))
    native_push._apns_jwt.update(token=None, at=0)
    tok = native_push._apns_auth_token()
    assert jwt.get_unverified_header(tok)["kid"] == "KEY123"
    assert jwt.decode(tok, key.public_key(), algorithms=["ES256"])["iss"] == "TEAM456"


def test_web_push_helper_also_hits_native():
    a = mk("a@x.edu")
    with app.app_context(), mock.patch("native_push.send_native_push") as nat:
        from utils import send_push_notification
        send_push_notification(a, "Hi", "there", "/messages")
    nat.assert_called_once_with(a, "Hi", "there", "/messages")
