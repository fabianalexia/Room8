import json
from room8_models import db


class User(db.Model):
    __tablename__ = "users"

    id            = db.Column(db.Integer, primary_key=True)
    email         = db.Column(db.String(255), unique=True, nullable=False, index=True)
    first_name    = db.Column(db.String(100))
    last_name     = db.Column(db.String(100))
    photo         = db.Column(db.String)
    password_hash = db.Column(db.String(255))

    # Basic profile
    bio           = db.Column(db.Text)
    age           = db.Column(db.Integer)
    budget        = db.Column(db.String(100))    # monthly housing budget

    # College identity
    school        = db.Column(db.String(200))    # university name
    class_year    = db.Column(db.String(30))     # Freshman / Sophomore / etc.
    major         = db.Column(db.String(200))

    # Housing preferences
    housing_type  = db.Column(db.String(30))     # on_campus / off_campus / either
    room_type     = db.Column(db.String(30))     # double / single / suite / apartment / any

    # Lifestyle / dorm preferences (JSON stored as text)
    dorm_prefs    = db.Column(db.Text)           # JSON string
    looking_for   = db.Column(db.Text)           # free text

    # Location & photo gallery
    location      = db.Column(db.String(200))
    photos        = db.Column(db.Text)           # JSON array of photo URLs

    def get_dorm_prefs(self):
        if not self.dorm_prefs:
            return {}
        try:
            return json.loads(self.dorm_prefs)
        except Exception:
            return {}

    def get_photos(self):
        if not self.photos:
            return []
        try:
            return json.loads(self.photos)
        except Exception:
            return []

    def public(self):
        name = f"{self.first_name or ''} {self.last_name or ''}".strip()
        return {
            "id":           self.id,
            "email":        self.email,
            "name":         name or self.email,
            "first_name":   self.first_name or "",
            "last_name":    self.last_name  or "",
            "photo":        self.photo,
            "bio":          self.bio,
            "age":          self.age,
            "budget":       self.budget,
            # college
            "school":       self.school,
            "class_year":   self.class_year,
            "major":        self.major,
            # housing
            "housing_type": self.housing_type,
            "room_type":    self.room_type,
            # lifestyle
            "dorm_prefs":   self.get_dorm_prefs(),
            "looking_for":  self.looking_for,
            # location & gallery
            "location":     self.location,
            "photos":       self.get_photos(),
        }
