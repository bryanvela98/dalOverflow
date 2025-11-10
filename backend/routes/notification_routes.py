"""
Description: Notification routes for handling notification-related API endpoints.
Last Modified By: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created with notification CRUD operations.
    2025-10-28 - Added notification delivery and status management.
"""
from flask import Blueprint, request, jsonify
from models.notification import Notification
import logging  # For logging purposes

notification_bp = Blueprint('notifications', __name__)

@notification_bp.route('/<user_id>', methods=['GET'])
def get_notifications(user_id):
    """Get notifications for a specific user.

    Args:
        user_id (str): The ID of the user to retrieve notifications for.

    Returns:
        JSON response containing the user's notifications.
    """
    try:
        notifications = Notification.get_notifications_for_user(user_id)
        if not notifications:
            return jsonify({"message": "No notifications found"}), 404
        return jsonify({
            "notifications": [notification.to_dict() for notification in notifications]
        })
    except Exception as e:
        logging.error(f"Error fetching notifications for user {user_id}: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
@notification_bp.route('/', methods=['POST'])
def create_notification():
    """Create a notification.

    Returns:
        JSON response containing the success message.
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id', 'header', 'body']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
            
        notification = Notification.create(data)
        return jsonify({
            'message': 'Notification created successfully',
            'notification': notification.to_dict()
        }), 201
    except Exception as e:
        logging.error(f"Error creating notification: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500