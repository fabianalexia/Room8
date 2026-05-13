from datetime import datetime
from room8_models import db


class RoommateConfirmation(db.Model):
    __tablename__ = "roommate_confirmations"

    id          = db.Column(db.Integer, primary_key=True)
    # Always store (smaller_id, larger_id) for uniqueness
    user_a_id   = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    user_b_id   = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    a_confirmed = db.Column(db.Boolean, nullable=False, default=False)
    b_confirmed = db.Column(db.Boolean, nullable=False, default=False)
    confirmed_at = db.Column(db.DateTime)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (db.UniqueConstraint("user_a_id", "user_b_id"),)

    @property
    def is_confirmed(self):
        return self.a_confirmed and self.b_confirmed
