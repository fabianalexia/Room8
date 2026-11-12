"""CORS: Netlify deploy previews of this site can call the API, other sites can't."""
import os
import tempfile

_db_file = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_db_file.name}")
os.environ.setdefault("JWT_SECRET_KEY", "test-secret")
os.environ.setdefault("FLASK_ENV", "testing")
os.environ.setdefault("RATELIMIT_ENABLED", "false")

from app import app  # noqa: E402


def _preflight(origin):
    return app.test_client().options(
        "/api/auth/login",
        headers={"Origin": origin, "Access-Control-Request-Method": "POST"},
    )


def test_deploy_preview_origin_allowed():
    origin = "https://deploy-preview-16--findroom8.netlify.app"
    assert _preflight(origin).headers.get("Access-Control-Allow-Origin") == origin


def test_production_origin_still_allowed():
    origin = "https://swiperoom8.com"
    assert _preflight(origin).headers.get("Access-Control-Allow-Origin") == origin


def test_other_netlify_sites_blocked():
    r = _preflight("https://deploy-preview-16--evil.netlify.app")
    assert r.headers.get("Access-Control-Allow-Origin") is None
