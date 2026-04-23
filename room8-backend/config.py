import os


def _db_url():
    url = os.environ.get('DATABASE_URL', 'sqlite:///room8.db')
    # Render and older Heroku provide postgres:// which SQLAlchemy 1.4+ requires as postgresql://
    if url.startswith('postgres://'):
        url = url.replace('postgres://', 'postgresql://', 1)
    return url


class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'supersecretkey'
    SQLALCHEMY_DATABASE_URI = _db_url()
    SQLALCHEMY_TRACK_MODIFICATIONS = False