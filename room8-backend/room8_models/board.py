from room8_models import db
from datetime import datetime


class Post(db.Model):
    __tablename__ = "posts"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    content    = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    likes   = db.relationship("PostLike",  backref="post", cascade="all, delete-orphan", lazy="dynamic")
    replies = db.relationship("PostReply", backref="post", cascade="all, delete-orphan", lazy="dynamic",
                               order_by="PostReply.created_at.asc()")

    def public(self, viewer_id=None):
        from room8_models.user import User
        author = db.session.get(User, self.user_id)
        liked = False
        if viewer_id:
            liked = self.likes.filter_by(user_id=viewer_id).first() is not None
        return {
            "id":          self.id,
            "user_id":     self.user_id,
            "author_name": author.public()["name"] if author else "Unknown",
            "author_photo": author.photo if author else None,
            "author_school": author.school if author else None,
            "content":     self.content,
            "created_at":  self.created_at.isoformat(),
            "like_count":  self.likes.count(),
            "reply_count": self.replies.count(),
            "liked_by_me": liked,
        }


class PostLike(db.Model):
    __tablename__ = "post_likes"

    id      = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_id = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False)

    __table_args__ = (
        db.UniqueConstraint("user_id", "post_id", name="uq_post_like"),
    )


class PostReply(db.Model):
    __tablename__ = "post_replies"

    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    post_id    = db.Column(db.Integer, db.ForeignKey("posts.id"), nullable=False, index=True)
    content    = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def public(self):
        from room8_models.user import User
        author = db.session.get(User, self.user_id)
        return {
            "id":          self.id,
            "user_id":     self.user_id,
            "author_name": author.public()["name"] if author else "Unknown",
            "author_photo": author.photo if author else None,
            "content":     self.content,
            "created_at":  self.created_at.isoformat(),
        }
