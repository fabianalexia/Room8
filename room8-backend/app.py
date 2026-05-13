import os
from flask import Flask, send_from_directory, jsonify
from flask_cors import CORS
from sqlalchemy import text

import cloudinary
import cloudinary.uploader
from datetime import timedelta
from flask_talisman import Talisman
from extensions import mail, jwt, limiter
from room8_models import db
from routes.auth_routes import auth_bp
from routes.candidates_routes import candidates_bp
from routes.swipe_routes import swipe_bp
from routes.message_routes import message_bp
from routes.profile_routes import profile_bp
from routes.photo_routes import photo_bp
from routes.survey_routes import survey_bp
from routes.board_routes import board_bp
from routes.report_routes import report_bp
from routes.safety_routes import safety_bp
from routes.match_routes import match_bp
from routes.roommate_routes import roommate_bp
from routes.migration_routes import migration_bp  # ONE-TIME — delete after use

# Load .env if present (development)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def create_app():
    # Fail fast if no secret key is configured — never silently use the dev fallback
    if not os.environ.get("JWT_SECRET_KEY") and not os.environ.get("SECRET_KEY"):
        if os.environ.get("FLASK_ENV") != "development":
            raise RuntimeError(
                "JWT_SECRET_KEY (or SECRET_KEY) environment variable must be set in production. "
                "Refusing to start with the insecure dev default."
            )

    app = Flask(__name__)

    # ── Database ───────────────────────────────────────────────
    db_url = os.environ.get("DATABASE_URL", "sqlite:///room8.db")
    # Render uses postgres:// but SQLAlchemy needs postgresql://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")

    # ── JWT ────────────────────────────────────────────────────
    app.config["JWT_SECRET_KEY"]            = os.environ.get("JWT_SECRET_KEY", app.config["SECRET_KEY"])
    # Bearer token in Authorization header — avoids cross-domain cookie issues
    # between swiperoom8.com (Netlify) and room8-4dq7.onrender.com (Render).
    app.config["JWT_TOKEN_LOCATION"]        = ["headers"]
    app.config["JWT_HEADER_NAME"]           = "Authorization"
    app.config["JWT_HEADER_TYPE"]           = "Bearer"
    app.config["JWT_ACCESS_TOKEN_EXPIRES"]  = timedelta(hours=24)
    app.config["JWT_REFRESH_TOKEN_EXPIRES"] = timedelta(days=30)
    jwt.init_app(app)

    # ── JWT token revocation via token_valid_after ─────────────
    @jwt.token_in_blocklist_loader
    def check_token_revoked(jwt_header, jwt_data):
        from room8_models.user import User as _User
        user_id = jwt_data.get("sub")
        if not user_id:
            return True
        user = db.session.get(_User, user_id)
        if not user or not user.token_valid_after:
            return False  # no invalidation timestamp set — token is valid
        return jwt_data.get("iat", 0) < user.token_valid_after.timestamp()

    # Use Redis for rate-limit storage in production; falls back to in-memory locally
    redis_url = os.environ.get("REDIS_URL")
    if redis_url:
        app.config["RATELIMIT_STORAGE_URI"] = redis_url
    limiter.init_app(app)

    # ── Cloudinary ─────────────────────────────────────────────
    cloudinary.config(
        cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
        api_key=os.environ.get("CLOUDINARY_API_KEY"),
        api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    )

    # ── Flask-Mail ─────────────────────────────────────────────
    app.config["MAIL_SERVER"]         = os.environ.get("MAIL_SERVER", "smtp.gmail.com")
    app.config["MAIL_PORT"]           = int(os.environ.get("MAIL_PORT", 587))
    app.config["MAIL_USE_TLS"]        = os.environ.get("MAIL_USE_TLS", "true").lower() != "false"
    app.config["MAIL_USE_SSL"]        = os.environ.get("MAIL_USE_SSL", "false").lower() == "true"
    app.config["MAIL_USERNAME"]       = os.environ.get("MAIL_USERNAME")
    app.config["MAIL_PASSWORD"]       = os.environ.get("MAIL_PASSWORD")
    app.config["MAIL_DEFAULT_SENDER"] = os.environ.get("MAIL_DEFAULT_SENDER", "Room8 <noreply@findroom8.com>")
    mail.init_app(app)

    # ── CORS ───────────────────────────────────────────────────
    raw_origins = os.environ.get(
        "CORS_ORIGINS",
        "https://swiperoom8.com,https://www.swiperoom8.com,"
        "https://findroom8.netlify.app,"
        "http://127.0.0.1:5173,http://localhost:5173,http://localhost:5174"
    )
    allowed_origins = [o.strip() for o in raw_origins.split(",") if o.strip()]

    CORS(
        app,
        resources={
            r"/api/*":     {"origins": allowed_origins},
            r"/uploads/*": {"origins": allowed_origins},
        },
        supports_credentials=True,
    )

    # ── Security headers ───────────────────────────────────────
    # force_https=False: Render terminates TLS; we don't need to redirect
    # content_security_policy=False: REST API — no HTML pages served
    # strict_transport_security=False: Render sets HSTS at the edge
    Talisman(
        app,
        force_https=False,
        strict_transport_security=False,
        content_security_policy=False,
        frame_options="DENY",
        x_content_type_options=True,
        referrer_policy="strict-origin-when-cross-origin",
    )

    db.init_app(app)

    # Import all models so create_all sees every table
    from room8_models import user, swipe, message  # noqa: F401
    from room8_models.survey import Survey          # noqa: F401
    from room8_models.board import Post, PostLike, PostReply  # noqa: F401
    from room8_models.report import Report                    # noqa: F401
    from room8_models.block import Block                      # noqa: F401
    from room8_models.roommate_confirmation import RoommateConfirmation  # noqa: F401
    from room8_models.notification import Notification                   # noqa: F401

    with app.app_context():
        db.create_all()

        # Safe SQLite column additions for existing databases
        _add_columns(db, [
            ("users", "bio",          "TEXT"),
            ("users", "age",          "INTEGER"),
            ("users", "budget",       "VARCHAR(100)"),
            ("users", "school",       "VARCHAR(200)"),
            ("users", "class_year",   "VARCHAR(30)"),
            ("users", "major",        "VARCHAR(200)"),
            ("users", "housing_type", "VARCHAR(30)"),
            ("users", "room_type",    "VARCHAR(30)"),
            ("users", "dorm_prefs",   "TEXT"),
            ("users", "looking_for",  "TEXT"),
            ("users", "location",     "VARCHAR(200)"),
            ("users", "photos",       "TEXT"),
            ("users", "first_name",      "VARCHAR(100)"),
            ("users", "last_name",       "VARCHAR(100)"),
            ("users", "profile_complete",    "BOOLEAN DEFAULT FALSE"),
            ("users", "email_verified",       "BOOLEAN DEFAULT FALSE"),
            ("users", "verification_token",   "VARCHAR(200)"),
            ("users", "reset_token",                "VARCHAR(200)"),
            ("users", "reset_token_expiry",         "TIMESTAMP"),
            ("users", "token_valid_after",          "TIMESTAMP"),
            ("users", "verification_token_expiry",  "TIMESTAMP"),
        ])

    # Serve uploaded profile photos
    upload_folder = os.environ.get("UPLOAD_FOLDER", "uploads")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"}), 200

    @app.route("/uploads/<path:filename>")
    def serve_upload(filename):
        upload_dir = os.path.join(app.root_path, upload_folder)
        return send_from_directory(upload_dir, filename)

    app.register_blueprint(auth_bp)
    app.register_blueprint(candidates_bp)
    app.register_blueprint(swipe_bp)
    app.register_blueprint(message_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(photo_bp)
    app.register_blueprint(survey_bp)
    app.register_blueprint(board_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(safety_bp)
    app.register_blueprint(match_bp)
    app.register_blueprint(roommate_bp)
    app.register_blueprint(migration_bp)  # ONE-TIME — delete after use

    if os.environ.get("FLASK_ENV") == "development":
        from routes.debug_routes import debug_bp
        app.register_blueprint(debug_bp)
        print("⚠️  debug_bp loaded (development only)")

    return app


def _add_columns(db, columns):
    """Add missing columns to existing tables. Uses IF NOT EXISTS (PostgreSQL 9.6+,
    SQLite 3.37+) so no error is raised when the column already exists."""
    for table, col, col_type in columns:
        try:
            db.session.execute(
                text(f"ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col} {col_type}")
            )
            db.session.commit()
        except Exception:
            # Fallback for SQLite < 3.37 which doesn't support IF NOT EXISTS
            db.session.rollback()
            try:
                db.session.execute(
                    text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
                )
                db.session.commit()
            except Exception:
                db.session.rollback()


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "production") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
