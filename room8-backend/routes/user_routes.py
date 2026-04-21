from flask import Blueprint, request, jsonify
from room8_models.user import User
from room8_models import db

# Blueprint setup
user_bp = Blueprint('user', __name__, url_prefix='/users')
print("✅ user_bp loaded")

# Test route to confirm blueprint is working
@user_bp.route('/ping', methods=['GET'])
def ping():
    return jsonify({"message": "pong"})

# Get all users
@user_bp.route('/', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "school": user.school,
        "bio": user.bio
    } for user in users])

# Get single user by ID
@user_bp.route('/<int:user_id>', methods=['GET'])
def get_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "school": user.school,
        "bio": user.bio
    })

# Update user profile
@user_bp.route('/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.json
    user.name = data.get('name', user.name)
    user.school = data.get('school', user.school)
    user.bio = data.get('bio', user.bio)

    db.session.commit()
    return jsonify({"message": "User updated successfully"})