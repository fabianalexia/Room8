from datetime import datetime
from room8_models import db


class DeviceToken(db.Model):
    """Native app push token. iOS tokens are APNs tokens, Android tokens are FCM tokens."""
    __tablename__ = "device_tokens"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    token      = db.Column(db.String(512), unique=True, nullable=False)
    platform   = db.Column(db.String(10), nullable=False)   # "ios" | "android"
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
