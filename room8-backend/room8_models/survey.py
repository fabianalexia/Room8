from room8_models import db
from datetime import datetime


class Survey(db.Model):
    __tablename__ = "surveys"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    answers = db.Column(db.Text, nullable=False)   # JSON string
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
