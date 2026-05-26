# routes/auth_routes.py
import os
import sys
import secrets
sys.stdout.reconfigure(line_buffering=True)
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify, redirect, session
from flask_mail import Message
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)
from werkzeug.security import generate_password_hash, check_password_hash
from requests_oauthlib import OAuth2Session

from extensions import mail, limiter
from room8_models.user import User
from room8_models import db
from utils import sanitize

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://swiperoom8.com")
BACKEND_URL  = os.environ.get("BACKEND_URL",  "https://room8-4dq7.onrender.com")

MIN_PASSWORD_LEN = 8
VERIFICATION_TTL = timedelta(hours=48)

# ── OAuth constants ────────────────────────────────────────────────────────────
OAUTH_CALLBACK_BASE = "https://swiperoom8.com/auth/callback"

GOOGLE_CLIENT_ID     = os.environ.get("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI  = f"{os.environ.get('BACKEND_URL', 'https://room8-4dq7.onrender.com')}/api/auth/google/callback"
GOOGLE_AUTH_URL      = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URL     = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL  = "https://www.googleapis.com/oauth2/v2/userinfo"

LINKEDIN_CLIENT_ID     = os.environ.get("LINKEDIN_CLIENT_ID", "")
LINKEDIN_CLIENT_SECRET = os.environ.get("LINKEDIN_CLIENT_SECRET", "")
LINKEDIN_REDIRECT_URI  = f"{os.environ.get('BACKEND_URL', 'https://room8-4dq7.onrender.com')}/api/auth/linkedin/callback"
LINKEDIN_AUTH_URL      = "https://www.linkedin.com/oauth/v2/authorization"
LINKEDIN_TOKEN_URL     = "https://www.linkedin.com/oauth/v2/accessToken"
LINKEDIN_USERINFO_URL  = "https://api.linkedin.com/v2/userinfo"


# ── helpers ───────────────────────────────────────────────────────────────────

def _send_verification_email(user):
    token = secrets.token_urlsafe(32)
    user.verification_token        = token
    user.verification_token_expiry = datetime.utcnow() + VERIFICATION_TTL
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
        <p>This link expires in 48 hours. If you didn't create a Room8 account, you can ignore this email.</p>
        """,
    )
    mail.send(msg)


def _issue_tokens(user):
    """Return tokens in the response body for client-side storage."""
    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify({"ok": True, "user": user.public(), "access_token": access_token, "refresh_token": refresh_token})


# ── register ──────────────────────────────────────────────────────────────────

@auth_bp.route("/register", methods=["POST"])
@limiter.limit("5 per hour")
def register():
    data = request.get_json(force=True) or {}
    email      = data.get("email", "").strip().lower()
    password   = data.get("password", "")
    first_name = sanitize(data.get("first_name", "").strip())
    last_name  = sanitize(data.get("last_name",  "").strip())

    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
    if len(password) < MIN_PASSWORD_LEN:
        return jsonify({"error": f"Password must be at least {MIN_PASSWORD_LEN} characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with that email already exists"}), 400

    is_student = email.endswith(".edu")
    new_user = User(
        email=email,
        password_hash=generate_password_hash(password),
        first_name=first_name,
        last_name=last_name,
        is_verified_student=is_student,
    )
    db.session.add(new_user)
    db.session.commit()

    # Send verification email (best-effort — don't block registration if mail fails)
    try:
        _send_verification_email(new_user)
    except Exception as e:
        print(f"[mail] verification send failed: {e}")

    return _issue_tokens(new_user), 201


# ── login ─────────────────────────────────────────────────────────────────────

@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute", error_message="Too many login attempts. Please wait a minute and try again.")
def login():
    data     = request.get_json(force=True) or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password_hash, password):
        return _issue_tokens(user), 200

    return jsonify({"error": "Invalid email or password"}), 401


# ── logout ────────────────────────────────────────────────────────────────────

@auth_bp.route("/logout", methods=["POST"])
@jwt_required(optional=True)
def logout():
    user_id = int(get_jwt_identity())
    if user_id:
        user = db.session.get(User, user_id)
        if user:
            user.token_valid_after = datetime.utcnow()
            db.session.commit()
    return jsonify({"ok": True})


# ── me (current user from JWT) ────────────────────────────────────────────────

@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"ok": True, "user": user.public()})


# ── refresh ───────────────────────────────────────────────────────────────────

@auth_bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    user_id      = int(get_jwt_identity())
    access_token = create_access_token(identity=str(user_id))
    return jsonify({"ok": True, "access_token": access_token})


# ── verify email ──────────────────────────────────────────────────────────────

@auth_bp.route("/verify-email", methods=["GET"])
def verify_email():
    token = request.args.get("token", "")
    user  = User.query.filter_by(verification_token=token).first()

    if not user or not token:
        return redirect(f"{FRONTEND_URL}/login?verified=false"), 302

    # Check 48-hour expiry
    if user.verification_token_expiry and datetime.utcnow() > user.verification_token_expiry:
        user.verification_token        = None
        user.verification_token_expiry = None
        db.session.commit()
        return redirect(f"{FRONTEND_URL}/login?verified=expired"), 302

    user.email_verified            = True
    user.verification_token        = None
    user.verification_token_expiry = None
    db.session.commit()
    return redirect(f"{FRONTEND_URL}/login?verified=true"), 302


# ── resend verification ───────────────────────────────────────────────────────

@auth_bp.route("/resend-verification", methods=["POST"])
@jwt_required()
@limiter.limit("3 per hour")
def resend_verification():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
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
@limiter.limit("3 per hour")
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
    if len(new_password) < MIN_PASSWORD_LEN:
        return jsonify({"error": f"Password must be at least {MIN_PASSWORD_LEN} characters"}), 400

    user = User.query.filter_by(reset_token=token).first()
    if not user or not user.reset_token_expiry:
        return jsonify({"error": "Invalid or expired reset link"}), 400
    if datetime.utcnow() > user.reset_token_expiry:
        return jsonify({"error": "Reset link has expired. Please request a new one."}), 400

    user.password_hash      = generate_password_hash(new_password)
    user.reset_token        = None
    user.reset_token_expiry = None
    # Invalidate all existing JWTs — any token issued before now is rejected
    user.token_valid_after  = datetime.utcnow()
    db.session.commit()

    return jsonify({"ok": True, "message": "Password updated. You can now log in."}), 200


# ── OAuth helpers ─────────────────────────────────────────────────────────────

def _oauth_login_or_create(email, first_name, last_name):
    """Find existing user or create new one from OAuth. Returns a JWT access token."""
    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(
            email=email,
            password_hash=generate_password_hash(secrets.token_hex(32)),
            first_name=first_name,
            last_name=last_name,
            email_verified=True,
            is_verified_student=email.endswith(".edu"),
        )
        db.session.add(user)
        db.session.commit()
    return create_access_token(identity=str(user.id))


# ── Google OAuth ──────────────────────────────────────────────────────────────

@auth_bp.route("/google")
def google_login():
    if not GOOGLE_CLIENT_ID:
        return jsonify({"error": "Google OAuth not configured"}), 503
    google = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI,
                           scope=["openid", "email", "profile"])
    auth_url, state = google.authorization_url(GOOGLE_AUTH_URL,
                                                access_type="offline",
                                                prompt="select_account")
    session["google_oauth_state"] = state
    return redirect(auth_url)


@auth_bp.route("/google/callback")
def google_callback():
    print(f"[google_callback] HIT - args: {dict(request.args)}")
    if request.args.get("error"):
        print(f"[google_callback] provider error: {request.args.get('error')}")
        return redirect(f"{OAUTH_CALLBACK_BASE}?error=access_denied")
    try:
        print("[google_callback] step 1: starting")
        session.pop("google_oauth_state", None)
        google = OAuth2Session(GOOGLE_CLIENT_ID, redirect_uri=GOOGLE_REDIRECT_URI)
        callback_url = request.url.replace("http://", "https://", 1)
        print(f"[google_callback] step 2: callback_url={callback_url}")
        google._state = None
        try:
            google.fetch_token(GOOGLE_TOKEN_URL, client_secret=GOOGLE_CLIENT_SECRET, authorization_response=callback_url, force_pkce=False)
            print("[google_callback] step 3: token fetched")
        except Exception as fetch_err:
            import traceback
            print(f"[google_callback] FETCH_TOKEN FAILED: {fetch_err}")
            print(traceback.format_exc())
            return redirect(f"{OAUTH_CALLBACK_BASE}?error=fetch_token_failed")
        info = google.get(GOOGLE_USERINFO_URL).json()
        print(f"[google_callback] step 4: userinfo={info}")
        email = (info.get("email") or "").strip().lower()
        first_name = info.get("given_name") or info.get("name", "").split()[0]
        last_name = info.get("family_name") or " ".join(info.get("name", "").split()[1:])
        print(f"[google_callback] step 5: email={email}")
        if not email:
            return redirect(f"{OAUTH_CALLBACK_BASE}?error=no_email")
        token = _oauth_login_or_create(email, first_name, last_name)
        print(f"[google_callback] step 6: token created, redirecting")
        return redirect(f"{OAUTH_CALLBACK_BASE}?token={token}")
    except Exception as e:
        import traceback
        print(f"[google_callback] OUTER error: {e}")
        print(traceback.format_exc())
        return redirect(f"{OAUTH_CALLBACK_BASE}?error=oauth_failed")


# ── LinkedIn OAuth ────────────────────────────────────────────────────────────

@auth_bp.route("/linkedin")
def linkedin_login():
    if not LINKEDIN_CLIENT_ID:
        return jsonify({"error": "LinkedIn OAuth not configured"}), 503
    linkedin = OAuth2Session(LINKEDIN_CLIENT_ID, redirect_uri=LINKEDIN_REDIRECT_URI,
                             scope=["openid", "email", "profile"])
    auth_url, state = linkedin.authorization_url(LINKEDIN_AUTH_URL)
    session["linkedin_oauth_state"] = state
    return redirect(auth_url)


@auth_bp.route("/linkedin/callback")
def linkedin_callback():
    if request.args.get("error"):
        print(f"[linkedin_callback] LinkedIn returned error: {request.args.get('error')}")
        return redirect(f"{OAUTH_CALLBACK_BASE}?error=access_denied")
    try:
        session.pop("linkedin_oauth_state", None)
        linkedin = OAuth2Session(LINKEDIN_CLIENT_ID, redirect_uri=LINKEDIN_REDIRECT_URI)
        callback_url = request.url.replace("http://", "https://", 1)
        linkedin._state = None
        linkedin.fetch_token(LINKEDIN_TOKEN_URL, client_secret=LINKEDIN_CLIENT_SECRET,
                             authorization_response=callback_url, force_pkce=False)
        info = linkedin.get(LINKEDIN_USERINFO_URL).json()
        email      = (info.get("email") or "").strip().lower()
        first_name = info.get("given_name") or info.get("name", "").split()[0]
        last_name  = info.get("family_name") or " ".join(info.get("name", "").split()[1:])
        if not email:
            return redirect(f"{OAUTH_CALLBACK_BASE}?error=no_email")
        token = _oauth_login_or_create(email, first_name, last_name)
        return redirect(f"{OAUTH_CALLBACK_BASE}?token={token}")
    except Exception as e:
        import traceback
        print(f"[linkedin_callback] error: {e}")
        print(traceback.format_exc())
        return redirect(f"{OAUTH_CALLBACK_BASE}?error=oauth_failed")
