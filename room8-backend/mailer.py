# mailer.py: one place to send email.
# Uses Resend (RESEND_API_KEY) when set, otherwise falls back to Flask-Mail SMTP.
import os

import requests


def _from_address() -> str:
    # Until swiperoom8.com is verified in Resend, only onboarding@resend.dev works,
    # and Resend will only deliver it to the Resend account owner's own inbox.
    return os.environ.get("MAIL_FROM", "Room8 <onboarding@resend.dev>")


def send_email(to, subject: str, html: str, cc=None) -> None:
    """Send an email. Raises on failure so callers can report it."""
    to = [to] if isinstance(to, str) else list(to)
    cc = list(cc or [])
    key = os.environ.get("RESEND_API_KEY", "").strip()

    if key:
        payload = {"from": _from_address(), "to": to, "subject": subject, "html": html}
        if cc:
            payload["cc"] = cc
        r = requests.post(
            "https://api.resend.com/emails",
            json=payload,
            headers={"Authorization": f"Bearer {key}"},
            timeout=15,
        )
        if r.status_code >= 300:
            raise RuntimeError(f"Resend error {r.status_code}: {r.text[:300]}")
        return

    from flask_mail import Message
    from extensions import mail
    mail.send(Message(subject=subject, recipients=to, cc=cc, html=html))
