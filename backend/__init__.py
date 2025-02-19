from flask import Flask
from backend.database import db  # Ensure this exists
from backend.routes import auth  # Ensure routes exist

def create_app():
    app = Flask(__name__)

    # Database configuration
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Initialize the database
    db.init_app(app)

    # Register Blueprints
    app.register_blueprint(auth)

    return app
