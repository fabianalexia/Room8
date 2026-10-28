from datetime import datetime
from room8_models import db


class School(db.Model):
    """Per-school unlock gate.

    A school stays locked (waitlist only) until enough verified students
    sign up, so early users never open the app to an empty deck.
    """
    __tablename__ = "schools"

    id               = db.Column(db.Integer, primary_key=True)
    name             = db.Column(db.String(200), unique=True, nullable=False, index=True)
    unlock_threshold = db.Column(db.Integer, nullable=False, default=50)
    is_unlocked      = db.Column(db.Boolean, nullable=False, default=False)
    unlocked_at      = db.Column(db.DateTime)
    # "auto" when the threshold was reached, "admin" when unlocked manually
    unlocked_by      = db.Column(db.String(20))
    created_at       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self, verified_count=None):
        data = {
            "id":               self.id,
            "name":             self.name,
            "unlock_threshold": self.unlock_threshold,
            "is_unlocked":      bool(self.is_unlocked),
            "unlocked_at":      self.unlocked_at.isoformat() if self.unlocked_at else None,
            "unlocked_by":      self.unlocked_by,
        }
        if verified_count is not None:
            data["verified_count"] = verified_count
            data["remaining"]      = max(0, self.unlock_threshold - verified_count)
        return data
