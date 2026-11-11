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
from mailer import send_email

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "https://swiperoom8.com")
BACKEND_URL  = os.environ.get("BACKEND_URL",  "https://room8-4dq7.onrender.com")

MIN_PASSWORD_LEN = 8
VERIFICATION_TTL = timedelta(hours=48)

# ── OAuth constants ────────────────────────────────────────────────────────────
OAUTH_CALLBACK_BASE = "https://swiperoom8.com/auth/callback"
# Native app deep link (must match appId in capacitor.config.json)
APP_CALLBACK_BASE   = os.environ.get("APP_CALLBACK_BASE", "com.swiperoom8.app://auth/callback")
APP_EXCHANGE_TTL    = timedelta(minutes=3)

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

def _check_school_unlock(user):
    """A newly verified student may push their school over the unlock threshold."""
    try:
        from school_gate import maybe_unlock
        if user.school:
            maybe_unlock(user.school)
    except Exception as e:
        print(f"[school_gate] unlock check failed: {e}")


def _send_verification_email(user):
    token = secrets.token_urlsafe(32)
    user.verification_token        = token
    user.verification_token_expiry = datetime.utcnow() + VERIFICATION_TTL
    db.session.commit()
    link = f"{BACKEND_URL}/api/auth/verify-email?token={token}"
    msg = dict(
        subject="Verify your Room8 email",
        to=[user.email],
        html=f"""
        <p>Hi {user.first_name or 'there'},</p>
        <p>Thanks for joining Room8! Click below to verify your email address:</p>
        <p><a href="{link}" style="background:#F59E0B;color:#050D1F;padding:12px 24px;
           border-radius:8px;text-decoration:none;font-weight:700;">Verify Email</a></p>
        <p>Or copy this link:<br><a href="{link}">{link}</a></p>
        <p>This link expires in 48 hours. If you didn't create a Room8 account, you can ignore this email.</p>
        """,
    )
    send_email(**msg)


def _issue_tokens(user):
    """Return tokens in the response body for client-side storage."""
    access_token  = create_access_token(identity=str(user.id))
    refresh_token = create_refresh_token(identity=str(user.id))
    return jsonify({"ok": True, "user": user.public(), "access_token": access_token, "refresh_token": refresh_token})


@auth_bp.route("/accept-terms", methods=["POST"])
@jwt_required()
def accept_terms():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    if not user.terms_accepted_at:
        user.terms_accepted_at = datetime.utcnow()
        db.session.commit()
    return jsonify({"ok": True, "user": user.public()})


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
        terms_accepted_at=datetime.utcnow() if data.get("agreed_to_terms") else None,
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
        if user.is_banned:
            return jsonify({"error": "This account has been suspended for breaking Room8's community rules."}), 403
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
    _check_school_unlock(user)
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
    msg = dict(
        subject="Reset your Room8 password",
        to=[user.email],
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
        send_email(**msg)
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


# ── delete account ────────────────────────────────────────────────────────────

@auth_bp.route("/account", methods=["DELETE"])
@jwt_required()
def delete_account():
    from room8_models.message              import Message
    from room8_models.swipe                import Swipe
    from room8_models.board                import Post, PostLike, PostReply
    from room8_models.notification         import Notification
    from room8_models.report               import Report
    from room8_models.block                import Block
    from room8_models.roommate_confirmation import RoommateConfirmation
    from room8_models.survey               import Survey
    import cloudinary
    import cloudinary.uploader

    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # 1. Messages (sent or received)
    Message.query.filter(
        (Message.sender_id == user_id) | (Message.recipient_id == user_id)
    ).delete(synchronize_session=False)

    # 2. Swipes (initiated by or targeting this user)
    Swipe.query.filter(
        (Swipe.user_id == user_id) | (Swipe.target_id == user_id)
    ).delete(synchronize_session=False)

    # 3. Board: replies, likes, posts (child rows first)
    PostReply.query.filter(PostReply.user_id == user_id).delete(synchronize_session=False)
    PostLike.query.filter(PostLike.user_id == user_id).delete(synchronize_session=False)
    # Cascade-delete replies/likes on posts owned by this user
    for post in Post.query.filter_by(user_id=user_id).all():
        PostReply.query.filter_by(post_id=post.id).delete(synchronize_session=False)
        PostLike.query.filter_by(post_id=post.id).delete(synchronize_session=False)
    Post.query.filter_by(user_id=user_id).delete(synchronize_session=False)

    # 4. Notifications (received or triggered by this user)
    Notification.query.filter(
        (Notification.user_id == user_id) | (Notification.from_user_id == user_id)
    ).delete(synchronize_session=False)

    # 5. Reports (filed by or against this user)
    Report.query.filter(
        (Report.reporter_id == user_id) | (Report.reported_id == user_id)
    ).delete(synchronize_session=False)

    # 6. Blocks (initiated by or targeting this user)
    Block.query.filter(
        (Block.blocker_id == user_id) | (Block.blocked_id == user_id)
    ).delete(synchronize_session=False)

    # 7. Roommate confirmations
    RoommateConfirmation.query.filter(
        (RoommateConfirmation.user_a_id == user_id) | (RoommateConfirmation.user_b_id == user_id)
    ).delete(synchronize_session=False)

    # 8. Survey responses
    Survey.query.filter_by(user_id=user_id).delete(synchronize_session=False)

    # 8a. Photo verifications (delete any selfie still stored)
    from room8_models.photo_verification import PhotoVerification
    from routes.verification_routes import delete_selfie
    for v in PhotoVerification.query.filter_by(user_id=user_id).all():
        delete_selfie(v)
    PhotoVerification.query.filter_by(user_id=user_id).delete(synchronize_session=False)

    # 8a2. Pending app sign-in codes
    from room8_models.oauth_exchange import OAuthExchange
    OAuthExchange.query.filter_by(user_id=user_id).delete(synchronize_session=False)

    # 8b. Push subscriptions (FK → users.id, must be removed before deleting user)
    from room8_models.push_subscription import PushSubscription
    PushSubscription.query.filter_by(user_id=user_id).delete(synchronize_session=False)

    # 9. Cloudinary photos (best-effort — don't block deletion if it fails)
    try:
        cloudinary.uploader.destroy(f"room8/profile/{user_id}", invalidate=True)
        cloudinary.api.delete_resources_by_prefix(f"room8/gallery/{user_id}/", invalidate=True)
    except Exception as e:
        print(f"[delete_account] Cloudinary cleanup failed for user {user_id}: {e}")

    # 10. Delete the user record
    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "Account deleted successfully"}), 200


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


def _oauth_user_id(email):
    return User.query.filter_by(email=email).first().id


def _oauth_finish(email, first_name, last_name, provider_session_key):
    """Redirect to the web callback with a JWT, or to the app with a one-time code."""
    token = _oauth_login_or_create(email, first_name, last_name)
    if session.pop(provider_session_key, False):
        import hashlib
        from room8_models.oauth_exchange import OAuthExchange
        code = secrets.token_urlsafe(32)
        db.session.add(OAuthExchange(
            code_hash=hashlib.sha256(code.encode()).hexdigest(),
            user_id=_oauth_user_id(email),
            expires_at=datetime.utcnow() + APP_EXCHANGE_TTL,
        ))
        db.session.commit()
        return redirect(f"{APP_CALLBACK_BASE}?code={code}")
    return redirect(f"{OAUTH_CALLBACK_BASE}?token={token}")


def _oauth_error(code, provider_session_key):
    base = APP_CALLBACK_BASE if session.pop(provider_session_key, False) else OAUTH_CALLBACK_BASE
    return redirect(f"{base}?error={code}")


@auth_bp.route("/app-exchange", methods=["POST"])
@limiter.limit("30 per hour")
def app_exchange():
    """Native app trades its one-time OAuth code for a JWT."""
    import hashlib
    from room8_models.oauth_exchange import OAuthExchange
    code = ((request.get_json(silent=True) or {}).get("code") or "").strip()
    if not code:
        return jsonify({"error": "code required"}), 400
    row = OAuthExchange.query.filter_by(code_hash=hashlib.sha256(code.encode()).hexdigest()).first()
    if not row or row.used or datetime.utcnow() > row.expires_at:
        return jsonify({"error": "Sign-in link expired. Please try again."}), 400
    row.used = True
    db.session.commit()
    user = db.session.get(User, row.user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    if user.is_banned:
        return jsonify({"error": "This account has been suspended."}), 403
    return _issue_tokens(user)


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
    session["google_oauth_app"] = request.args.get("app") == "1"
    return redirect(auth_url)


@auth_bp.route("/google/callback")
def google_callback():
    print(f"[google_callback] HIT - args: {dict(request.args)}")
    if request.args.get("error"):
        print(f"[google_callback] provider error: {request.args.get('error')}")
        return _oauth_error("access_denied", "google_oauth_app")
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
            return _oauth_error("fetch_token_failed", "google_oauth_app")
        info = google.get(GOOGLE_USERINFO_URL).json()
        print(f"[google_callback] step 4: userinfo={info}")
        email = (info.get("email") or "").strip().lower()
        first_name = info.get("given_name") or info.get("name", "").split()[0]
        last_name = info.get("family_name") or " ".join(info.get("name", "").split()[1:])
        print(f"[google_callback] step 5: email={email}")
        if not email:
            return _oauth_error("no_email", "google_oauth_app")
        print(f"[google_callback] step 6: signing in, redirecting")
        return _oauth_finish(email, first_name, last_name, "google_oauth_app")
    except Exception as e:
        import traceback
        print(f"[google_callback] OUTER error: {e}")
        print(traceback.format_exc())
        return _oauth_error("oauth_failed", "google_oauth_app")


# ── LinkedIn OAuth ────────────────────────────────────────────────────────────

@auth_bp.route("/linkedin")
def linkedin_login():
    if not LINKEDIN_CLIENT_ID:
        return jsonify({"error": "LinkedIn OAuth not configured"}), 503
    linkedin = OAuth2Session(LINKEDIN_CLIENT_ID, redirect_uri=LINKEDIN_REDIRECT_URI,
                             scope=["openid", "email", "profile"])
    auth_url, state = linkedin.authorization_url(LINKEDIN_AUTH_URL)
    session["linkedin_oauth_state"] = state
    session["linkedin_oauth_app"] = request.args.get("app") == "1"
    return redirect(auth_url)


@auth_bp.route("/linkedin/callback")
def linkedin_callback():
    if request.args.get("error"):
        print(f"[linkedin_callback] LinkedIn returned error: {request.args.get('error')}")
        return _oauth_error("access_denied", "linkedin_oauth_app")
    try:
        session.pop("linkedin_oauth_state", None)
        linkedin = OAuth2Session(LINKEDIN_CLIENT_ID, redirect_uri=LINKEDIN_REDIRECT_URI)
        callback_url = request.url.replace("http://", "https://", 1)
        linkedin._state = None
        linkedin.fetch_token(
            LINKEDIN_TOKEN_URL,
            client_secret=LINKEDIN_CLIENT_SECRET,
            authorization_response=callback_url,
            force_pkce=False,
            include_client_id=True,
            auth=None,
        )
        info = linkedin.get(LINKEDIN_USERINFO_URL).json()
        email      = (info.get("email") or "").strip().lower()
        first_name = info.get("given_name") or info.get("name", "").split()[0]
        last_name  = info.get("family_name") or " ".join(info.get("name", "").split()[1:])
        if not email:
            return _oauth_error("no_email", "linkedin_oauth_app")
        return _oauth_finish(email, first_name, last_name, "linkedin_oauth_app")
    except Exception as e:
        import traceback
        print(f"[linkedin_callback] error: {e}")
        print(traceback.format_exc())
        return _oauth_error("oauth_failed", "linkedin_oauth_app")
