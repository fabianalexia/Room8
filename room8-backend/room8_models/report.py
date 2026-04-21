from room8_models import db
from datetime import datetime


class Report(db.Model):
    __tablename__ = "reports"

    id          = db.Column(db.Integer, primary_key=True)
    reporter_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    reported_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    reason      = db.Column(db.String(100), nullable=False, default="inappropriate")
    notes       = db.Column(db.Text)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
