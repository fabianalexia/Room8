from datetime import datetime
from room8_models import db


class OAuthExchange(db.Model):
    """One-time code handed to the native app after OAuth.

    The app trades it for a JWT, so the token itself never travels through a
    custom URL scheme that another app could intercept.
    """
    __tablename__ = "oauth_exchanges"

    id         = db.Column(db.Integer, primary_key=True)
    code_hash  = db.Column(db.String(64), unique=True, nullable=False, index=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used       = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
