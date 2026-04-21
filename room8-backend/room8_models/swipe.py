from room8_models import db
from datetime import datetime

class Swipe(db.Model):
    __tablename__ = "swipes"

    id = db.Column(db.Integer, primary_key=True)
    user_id   = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    target_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    action    = db.Column(db.String(10), nullable=False)  # "like" or "skip"
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        db.UniqueConstraint("user_id", "target_id", name="uq_swipe_once"),
    )