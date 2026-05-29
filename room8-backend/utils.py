# utils.py — shared sanitization and notification helpers

import json
import os
from html.parser import HTMLParser

# Tags whose entire content (not just the tag itself) must be dropped
_SKIP_CONTENT_TAGS = {"script", "style", "iframe", "object", "embed"}


class _TagStripper(HTMLParser):
    """HTML-tag stripper using Python's built-in parser.

    Drops all tags.  Also drops the *content* of script/style/iframe
    elements so that ``<script>alert(1)</script>`` becomes ``''``, not
    ``'alert(1)'``.
    """

    def __init__(self):
        super().__init__()
        self._parts: list[str] = []
        self._skip_depth: int = 0   # >0 means we're inside a skipped element

    def handle_starttag(self, tag, attrs):
        if tag.lower() in _SKIP_CONTENT_TAGS:
            self._skip_depth += 1

    def handle_endtag(self, tag):
        if tag.lower() in _SKIP_CONTENT_TAGS and self._skip_depth > 0:
            self._skip_depth -= 1

    def handle_data(self, data):
        if self._skip_depth == 0:
            self._parts.append(data)

    def get_text(self) -> str:
        return "".join(self._parts)


def strip_tags(value: str | None) -> str | None:
    """Remove all HTML tags (and script/style content) from a string.
    Returns None unchanged."""
    if not value:
        return value
    stripper = _TagStripper()
    stripper.feed(value)
    return stripper.get_text()


def sanitize(value: str | None, max_len: int | None = None) -> str | None:
    """Strip HTML tags and optionally enforce a maximum length.

    Returns None when value is None/empty.
    Raises ValueError when the stripped value exceeds max_len.
    """
    cleaned = strip_tags(value)
    if cleaned is not None and max_len is not None and len(cleaned) > max_len:
        raise ValueError(f"Value exceeds maximum length of {max_len} characters.")
    return cleaned


def send_push_notification(user_id: int, title: str, body: str, url: str = "/") -> None:
    """Send a Web Push notification to user_id if they have a stored subscription.

    Silently no-ops when VAPID keys are not configured or the user has no
    subscription.  Expired/gone subscriptions (410) are automatically cleaned up.

    VAPID env vars required:
      VAPID_PRIVATE_KEY  — PEM string (multi-line OK; \\n accepted)
      VAPID_CLAIMS_EMAIL — e.g. partner@swiperoom8.com
    """
    vapid_private_key = os.environ.get("VAPID_PRIVATE_KEY", "").strip().replace("\\n", "\n")
    if not vapid_private_key:
        return  # VAPID not configured — skip silently

    try:
        from pywebpush import webpush, WebPushException
        from room8_models.push_subscription import PushSubscription
        from room8_models import db
    except ImportError:
        return  # pywebpush not installed — skip silently

    sub = PushSubscription.query.filter_by(user_id=user_id).first()
    if not sub:
        return

    claims_email = os.environ.get("VAPID_CLAIMS_EMAIL", "partner@swiperoom8.com")

    try:
        webpush(
            subscription_info=json.loads(sub.subscription_json),
            data=json.dumps({"title": title, "body": body, "url": url}),
            vapid_private_key=vapid_private_key,
            vapid_claims={"sub": f"mailto:{claims_email}"},
        )
    except Exception as exc:
        exc_str = str(exc)
        # 410 Gone = subscription is no longer valid; remove it
        if "410" in exc_str or "404" in exc_str:
            try:
                db.session.delete(sub)
                db.session.commit()
            except Exception:
                db.session.rollback()
        else:
            print(f"[push] Error sending push to user {user_id}: {exc}")
