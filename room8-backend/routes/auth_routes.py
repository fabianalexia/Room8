# routes/auth_routes.py
import os
import secrets
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify, redirect
from flask_mail import Message
from werkzeug.security import generate_password_hash, check_password_hash

from extensions import mail
from room8_models.user import User
from room8_models import db

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://findroom8.netlify.app")
BACKEND_URL  = os.environ.get("BACKEND_URL",  "https://room8-4dq7.onrender.com")


# ── helpers ───────────────────────────────────────────────────────────────────

def _send_verification_email(user):
    token = secrets.token_urlsafe(32)
    user.verification_token = token
    db.session.commit()
    link = f"{BACKEND_URL}/api/auth/verify-email?token={token}"
    msg = Message(
        subject="Verify your Room8 email",
        recipients=[user.email],
        html=f"""
        <p>Hi {user.first_name or 'there'},</p>
        <p>Thanks for joining Room8! Click below to verify your email address:</p>
        <p><a href="{link}" style="background:#F59E0B;color:#050D1F;padding:12px 24px;
           border-radius:8px;text-decoration:none;font-weight:700;">Verify Email</a></p>
        <p>Or copy this link:<br><a href="{link}">{link}</a></p>
        <p>If you didn't create a Room8 account, you can ignore this email.</p>
        """,
    )
    mail.send(msg)


# ── register ──────────────────────────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(force=True) or {}
    email      = data.get("email", "").strip().lower()
    password   = data.get("password", "")
    first_name = data.get("first_name", "").strip()
    last_name  = data.get("last_name", "").strip()

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if not email.endswith(".edu"):
        return jsonify({"error": "Please use a .edu email address to register"}), 400
    if len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with that email already exists"}), 400

    new_user = User(
        email=email,
        password_hash=generate_password_hash(password),
        first_name=first_name,
        last_name=last_name,
    )
    db.session.add(new_user)
    db.session.commit()

    # Send verification email (best-effort — don't block registration if mail fails)
    try:
        _send_verification_email(new_user)
    except Exception as e:
        print(f"[mail] verification send failed: {e}")

    return jsonify({"ok": True, "user": new_user.public()}), 201


# ── login ─────────────────────────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
def login():
    data     = request.get_json(force=True) or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify({"ok": True, "user": user.public()}), 200

    return jsonify({"error": "Invalid email or password"}), 401


# ── verify email ──────────────────────────────────────────────────────────────

@auth_bp.route("/verify-email", methods=["GET"])
def verify_email():
    token = request.args.get("token", "")
    user  = User.query.filter_by(verification_token=token).first()

    if not user or not token:
        return redirect(f"{FRONTEND_URL}/login?verified=false"), 302

    user.email_verified     = True
    user.verification_token = None
    db.session.commit()
    return redirect(f"{FRONTEND_URL}/login?verified=true"), 302


# ── resend verification ───────────────────────────────────────────────────────

@auth_bp.route("/resend-verification", methods=["POST"])
def resend_verification():
    data    = request.get_json(force=True) or {}
    user_id = data.get("user_id")
    if not user_id:
        return jsonify({"error": "user_id required"}), 400

    user = db.session.get(User, int(user_id))
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.email_verified:
        return jsonify({"ok": True, "message": "Already verified"}), 200

    try:
        _send_verification_email(user)
    except Exception as e:
        print(f"[mail] resend failed: {e}")
        return jsonify({"error": "Failed to send email. Try again shortly."}), 500

    return jsonify({"ok": True, "message": "Verification email sent"}), 200


# ── forgot password ───────────────────────────────────────────────────────────

@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data  = request.get_json(force=True) or {}
    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({"error": "Email required"}), 400

    user = User.query.filter_by(email=email).first()
    # Always return 200 to prevent email enumeration
    if not user:
        return jsonify({"ok": True, "message": "If that email exists, a reset link has been sent."}), 200

    token  = secrets.token_urlsafe(32)
    expiry = datetime.utcnow() + timedelta(hours=1)
    user.reset_token        = token
    user.reset_token_expiry = expiry
    db.session.commit()

    link = f"{FRONTEND_URL}/reset-password?token={token}"
    msg = Message(
        subject="Reset your Room8 password",
        recipients=[user.email],
        html=f"""
        <p>Hi {user.first_name or 'there'},</p>
        <p>We received a request to reset your Room8 password. Click below to choose a new one:</p>
        <p><a href="{link}" style="background:#F59E0B;color:#050D1F;padding:12px 24px;
           border-radius:8px;text-decoration:none;font-weight:700;">Reset Password</a></p>
        <p>Or copy this link:<br><a href="{link}">{link}</a></p>
        <p>This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.</p>
        """,
    )
    try:
        mail.send(msg)
    except Exception as e:
        print(f"[mail] reset send failed: {e}")
        return jsonify({"error": "Failed to send email. Try again shortly."}), 500

    return jsonify({"ok": True, "message": "If that email exists, a reset link has been sent."}), 200


# ── reset password ────────────────────────────────────────────────────────────

@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data         = request.get_json(force=True) or {}
    token        = data.get("token", "")
    new_password = data.get("new_password", "")

    if not token or not new_password:
        return jsonify({"error": "Token and new_password required"}), 400
    if len(new_password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user or not user.reset_token_expiry:
        return jsonify({"error": "Invalid or expired reset link"}), 400
    if datetime.utcnow() > user.reset_token_expiry:
        return jsonify({"error": "Reset link has expired. Please request a new one."}), 400

    user.password_hash      = generate_password_hash(new_password)
    user.reset_token        = None
    user.reset_token_expiry = None
    db.session.commit()

    return jsonify({"ok": True, "message": "Password updated. You can now log in."}), 200
