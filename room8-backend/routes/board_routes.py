from flask import Blueprint, request, jsonify
from room8_models import db
from room8_models.board import Post, PostLike, PostReply

board_bp = Blueprint("board", __name__, url_prefix="/api/board")

PAGE_SIZE = 20


@board_bp.get("")
def list_posts():
    viewer_id = request.args.get("user_id", type=int)
    offset    = request.args.get("offset", 0, type=int)

    posts = (
        Post.query
        .order_by(Post.created_at.desc())
        .offset(offset)
        .limit(PAGE_SIZE)
        .all()
    )
    return jsonify([p.public(viewer_id=viewer_id) for p in posts])


@board_bp.post("")
def create_post():
    data    = request.get_json(force=True) or {}
    user_id = data.get("user_id")
    content = (data.get("content") or "").strip()

    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    if not content:
        return jsonify({"error": "content required"}), 400
    if len(content) > 500:
        return jsonify({"error": "Post too long (max 500 chars)"}), 400

    post = Post(user_id=user_id, content=content)
    db.session.add(post)
    db.session.commit()
    return jsonify({"ok": True, "post": post.public(viewer_id=user_id)}), 201


@board_bp.post("/<int:post_id>/like")
def toggle_like(post_id):
    data    = request.get_json(force=True) or {}
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    existing = PostLike.query.filter_by(user_id=user_id, post_id=post_id).first()
    if existing:
        db.session.delete(existing)
        liked = False
    else:
        db.session.add(PostLike(user_id=user_id, post_id=post_id))
        liked = True

    db.session.commit()
    return jsonify({"ok": True, "liked": liked, "like_count": post.likes.count()})


@board_bp.get("/<int:post_id>/replies")
def get_replies(post_id):
    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    return jsonify([r.public() for r in post.replies])


@board_bp.post("/<int:post_id>/replies")
def add_reply(post_id):
    data    = request.get_json(force=True) or {}
    user_id = data.get("user_id")
    content = (data.get("content") or "").strip()

    if not user_id:
        return jsonify({"error": "user_id required"}), 400
    if not content:
        return jsonify({"error": "content required"}), 400
    if len(content) > 300:
        return jsonify({"error": "Reply too long (max 300 chars)"}), 400

    post = db.session.get(Post, post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    reply = PostReply(user_id=user_id, post_id=post_id, content=content)
    db.session.add(reply)
    db.session.commit()
    return jsonify({"ok": True, "reply": reply.public()}), 201
