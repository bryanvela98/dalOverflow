"""
Description: comment routes for handling requests related to comments
Last Modified By: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-11-27 - File created and CRUD operations implemented.
"""
from flask import Blueprint, request, jsonify
from models.comment import Comment
import logging  # For logging purposes

comment_bp = Blueprint('comments', __name__)

@comment_bp.route('/', methods=['POST'])
def create_comment():
    """Create a comment.

    Returns:
        JSON response containing the success message.
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['user_id','answer_id', 'content']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        comment = Comment.create(data)
        return jsonify({
            'message': 'Comment created successfully',
            'comment': comment.to_dict()
        }), 201
    except Exception as e:
        logging.error(f"Error creating comment: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500