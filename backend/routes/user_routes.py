"""
Description: User routes for handling user-related API endpoints.
Last Modified By: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created with user CRUD operations.
    2025-10-28 - Added error handling and logging functionality.
"""
from flask import Blueprint, request, jsonify
from models.user import User
import logging  # For logging purposes

user_bp = Blueprint('users', __name__)

@user_bp.route('/', methods=['GET'])
def get_users():
    """Get all users.

    Returns:
        JSON response containing the list of users.
    """
    try:
        users = User.get_all()
        if not users:
            return jsonify({"message": "No users found"}), 404
        return jsonify({
            "users": [user.to_dict() for user in users]
        })
    except Exception as e:
        logging.error(f"Error fetching users: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@user_bp.route('/', methods=['POST'])
def create_user():
    """Create a user.

    Returns:
        JSON response containing the success message.
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['username', 'email', 'password', 'display_name', 'profile_picture_url', 'reputation', 'registration_date', 'university']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
            
        user = User.create(data)
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        logging.error(f"Error creating user: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500