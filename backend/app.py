from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__, static_folder="build", static_url_path="")
CORS(app)  # Enable cross-origin requests for React frontend

# In-memory storage for users (temporary; use a database for production)
users = [
    {"id": 1, "name": "Alex", "age": 21, "school": "Evergreen State College", "bio": "Looking for a quiet roommate."},
    {"id": 2, "name": "Jordan", "age": 23, "school": "University of Washington", "bio": "I love cooking and need a tidy roommate."},
]

# API Routes
@app.route("/api/users", methods=["GET"])
def get_users():
    """Get all users."""
    return jsonify(users)


@app.route("/api/users", methods=["POST"])
def create_user():
    """Create a new user."""
    data = request.json
    if not data or not all(k in data for k in ("name", "age", "school", "bio")):
        return jsonify({"error": "Missing required fields"}), 400

    new_user = {
        "id": len(users) + 1,
        "name": data["name"],
        "age": data["age"],
        "school": data["school"],
        "bio": data["bio"],
    }
    users.append(new_user)
    return jsonify(new_user), 201


@app.route("/api/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    """Get a specific user by ID."""
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user)


@app.route("/api/users/<int:user_id>", methods=["DELETE"])
def delete_user(user_id):
    """Delete a user by ID."""
    global users
    users = [u for u in users if u["id"] != user_id]
    return jsonify({"message": "User deleted"}), 200


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


# Run the app
if __name__ == "__main__":
    app.run(debug=True)