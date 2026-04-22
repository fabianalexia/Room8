import os
from flask import Flask, send_from_directory
from flask_cors import CORS
from sqlalchemy import text

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
from routes.debug_routes import debug_bp

# Load .env if present (development)
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass


def create_app():
    app = Flask(__name__)

    # ── Database ───────────────────────────────────────────────
    db_url = os.environ.get("DATABASE_URL", "sqlite:///room8.db")
    # Render uses postgres:// but SQLAlchemy needs postgresql://
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)
    app.config["SQLALCHEMY_DATABASE_URI"] = db_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY", "dev-secret-change-me")

    # ── CORS ───────────────────────────────────────────────────
    raw_origins = os.environ.get(
        "CORS_ORIGINS",
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

    db.init_app(app)

    # Import all models so create_all sees every table
    from room8_models import user, swipe, message  # noqa: F401
    from room8_models.survey import Survey          # noqa: F401
    from room8_models.board import Post, PostLike, PostReply  # noqa: F401
    from room8_models.report import Report                    # noqa: F401

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
            ("users", "first_name",   "VARCHAR(100)"),
            ("users", "last_name",    "VARCHAR(100)"),
        ])

    # Serve uploaded profile photos
    upload_folder = os.environ.get("UPLOAD_FOLDER", "uploads")

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
    app.register_blueprint(debug_bp)

    try:
        from routes.user_routes import user_bp
        app.register_blueprint(user_bp)
        print("✅ user_bp loaded")
    except Exception:
        pass

    return app


def _add_columns(db, columns):
    """Safely add columns to existing SQLite tables (no-op if already present)."""
    for table, col, col_type in columns:
        try:
            db.session.execute(text(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}"))
            db.session.commit()
        except Exception:
            db.session.rollback()


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV", "production") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
