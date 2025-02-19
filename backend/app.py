from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from backend.database import db  # Import database
from backend.auth import auth  # Import authentication blueprint
from backend.models import User  # Import User model

# Initialize Flask app
def create_app():
    app = Flask(__name__, static_folder="build", static_url_path="")
    CORS(app)  # Enable cross-origin requests for React frontend

    # Database configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///room8.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    db.init_app(app)

    # Register authentication routes
    app.register_blueprint(auth, url_prefix="/api")

    # Serve React frontend
    @app.route("/", defaults={"path": ""})
    @app.route("/<path:path>")
    def serve_react(path):
        """Serve React build files."""
        if path != "" and app.static_folder:
            return send_from_directory(app.static_folder, path)
        return send_from_directory(app.static_folder, "index.html")

    # Error handler for 404
    @app.errorhandler(404)
    def not_found(e):
        """Redirect 404 errors to React app."""
        return send_from_directory(app.static_folder, "index.html")

    return app

# Run the app
if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        db.create_all()  # Create database tables
    app.run(debug=True)
