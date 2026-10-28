from datetime import datetime
from room8_models import db


class PhotoVerification(db.Model):
    """Selfie-with-pose verification, reviewed manually by an admin (Option B).

    Lifecycle: awaiting_selfie -> pending -> approved | rejected
    The selfie itself is deleted from Cloudinary as soon as it is reviewed,
    so we never keep face images longer than needed.
    """
    __tablename__ = "photo_verifications"

    id               = db.Column(db.Integer, primary_key=True)
    user_id          = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    pose_code        = db.Column(db.String(40), nullable=False)
    status           = db.Column(db.String(20), nullable=False, default="awaiting_selfie", index=True)
    selfie_public_id = db.Column(db.String(300))   # Cloudinary authenticated asset id
    consent_at       = db.Column(db.DateTime)
    reject_reason    = db.Column(db.String(200))
    created_at       = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    submitted_at     = db.Column(db.DateTime)
    reviewed_at      = db.Column(db.DateTime)
    reviewed_by      = db.Column(db.Integer)
