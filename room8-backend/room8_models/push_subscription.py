from datetime import datetime
from room8_models import db


class PushSubscription(db.Model):
    __tablename__ = "push_subscriptions"

    id                = db.Column(db.Integer, primary_key=True)
    user_id           = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True)
    subscription_json = db.Column(db.Text, nullable=False)
    created_at        = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<PushSubscription user_id={self.user_id}>"
