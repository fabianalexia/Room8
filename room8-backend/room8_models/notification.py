from datetime import datetime
from room8_models import db


class Notification(db.Model):
    __tablename__ = "notifications"

    id           = db.Column(db.Integer, primary_key=True)
    user_id      = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    # "roommate_request" or "roommate_confirmed"
    type         = db.Column(db.String(50), nullable=False)
    from_user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    read         = db.Column(db.Boolean, nullable=False, default=False)
    created_at   = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
