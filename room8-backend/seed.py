# seed.py
from room8_models import db
from room8_models.user import User
from room8_models.swipe import Swipe
from room8_models.message import Message

from werkzeug.security import generate_password_hash
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///room8.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    CORS(app)
    db.init_app(app)
    return app

def run_seed():
    app = create_app()
    with app.app_context():
        db.create_all()

        if User.query.count() == 0:
            demo = [
                dict(first_name="Alex", last_name="A", email="a@a.com",
                     photo="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=1200&q=80"),
                dict(first_name="Bri",  last_name="B", email="b@b.com",
                     photo="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=1200&q=80"),
                dict(first_name="Cam",  last_name="C", email="c@c.com",
                     photo="https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=1200&q=80"),
                dict(first_name="Dee",  last_name="D", email="d@d.com",
                     photo="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200&q=80"),
            ]
            for d in demo:
                u = User(
                    email=d["email"],
                    first_name=d["first_name"],
                    last_name=d["last_name"],
                    photo=d["photo"],
                    password_hash=generate_password_hash("password"),
                )
                db.session.add(u)
            db.session.commit()

        print(f"Users in DB: {User.query.count()}")

if __name__ == "__main__":
    run_seed()