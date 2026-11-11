# native_push.py: push notifications to the iOS and Android apps.
#
# Android -> Firebase Cloud Messaging HTTP v1
#   FIREBASE_SERVICE_ACCOUNT  full service-account JSON (one line is fine)
# iOS -> Apple Push Notification service (token auth)
#   APNS_KEY_ID, APNS_TEAM_ID, APNS_AUTH_KEY (contents of the .p8 file),
#   APNS_TOPIC (bundle id, default com.swiperoom8.app), APNS_SANDBOX=true for TestFlight dev builds
#
# Every sender silently no-ops when its settings are missing, so this is safe to
# deploy before Apple/Firebase are set up.
import json
import os
import time

import requests

_apns_jwt = {"token": None, "at": 0}


def _fcm_send(token: str, title: str, body: str, url: str) -> str:
    """Returns "ok", "gone" (token dead), or "skip"/"error"."""
    raw = os.environ.get("FIREBASE_SERVICE_ACCOUNT", "").strip()
    if not raw:
        return "skip"
    from google.oauth2 import service_account
    from google.auth.transport.requests import Request

    info = json.loads(raw)
    creds = service_account.Credentials.from_service_account_info(
        info, scopes=["https://www.googleapis.com/auth/firebase.messaging"]
    )
    creds.refresh(Request())
    r = requests.post(
        f"https://fcm.googleapis.com/v1/projects/{info['project_id']}/messages:send",
        headers={"Authorization": f"Bearer {creds.token}"},
        json={"message": {
            "token": token,
            "notification": {"title": title, "body": body},
            "data": {"url": url},
            "android": {"priority": "high"},
        }},
        timeout=10,
    )
    if r.status_code == 200:
        return "ok"
    if r.status_code == 404 or "UNREGISTERED" in r.text:
        return "gone"
    print(f"[fcm] {r.status_code} {r.text[:200]}")
    return "error"


def _apns_auth_token() -> str | None:
    key_id, team_id = os.environ.get("APNS_KEY_ID"), os.environ.get("APNS_TEAM_ID")
    key = os.environ.get("APNS_AUTH_KEY", "").replace("\\n", "\n").strip()
    if not (key_id and team_id and key):
        return None
    # Apple wants the token reused, refreshed at most every 20-60 minutes
    if _apns_jwt["token"] and time.time() - _apns_jwt["at"] < 45 * 60:
        return _apns_jwt["token"]
    import jwt
    tok = jwt.encode({"iss": team_id, "iat": int(time.time())}, key, algorithm="ES256", headers={"kid": key_id})
    _apns_jwt.update(token=tok, at=time.time())
    return tok


def _apns_send(token: str, title: str, body: str, url: str) -> str:
    auth = _apns_auth_token()
    if not auth:
        return "skip"
    import httpx
    host = "api.sandbox.push.apple.com" if os.environ.get("APNS_SANDBOX", "").lower() == "true" else "api.push.apple.com"
    with httpx.Client(http2=True, timeout=10) as client:
        r = client.post(
            f"https://{host}/3/device/{token}",
            headers={
                "authorization": f"bearer {auth}",
                "apns-topic": os.environ.get("APNS_TOPIC", "com.swiperoom8.app"),
                "apns-push-type": "alert",
                "apns-priority": "10",
            },
            json={"aps": {"alert": {"title": title, "body": body}, "sound": "default"}, "url": url},
        )
    if r.status_code == 200:
        return "ok"
    if r.status_code == 410 or "BadDeviceToken" in r.text or "Unregistered" in r.text:
        return "gone"
    print(f"[apns] {r.status_code} {r.text[:200]}")
    return "error"


def send_native_push(user_id: int, title: str, body: str, url: str = "/") -> int:
    """Send to every app install of this user. Returns how many were delivered."""
    from room8_models import db
    from room8_models.device_token import DeviceToken

    delivered = 0
    for dt in DeviceToken.query.filter_by(user_id=user_id).all():
        try:
            sender = _apns_send if dt.platform == "ios" else _fcm_send
            result = sender(dt.token, title, body, url)
        except Exception as e:
            print(f"[native_push] {dt.platform} send failed for user {user_id}: {e}")
            continue
        if result == "ok":
            delivered += 1
        elif result == "gone":
            db.session.delete(dt)
    db.session.commit()
    return delivered
