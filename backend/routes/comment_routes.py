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
    
@comment_bp.route('/<int:comment_id>', methods=['PATCH'])
def update_comment(comment_id):
    """Update a comment's content.
    
    Args:
        comment_id: ID of the comment to update
        
    Returns:
        JSON response containing the updated comment.
    """
    try:
        data = request.get_json()
        
        # Find the comment
        comment = Comment.query.get(comment_id)
        if not comment:
            return jsonify({'error': 'Comment not found'}), 404
        
        # Validate content field
        if 'content' not in data:
            return jsonify({'error': 'content is required'}), 400
            
        if not data['content'] or data['content'].strip() == '':
            return jsonify({'error': 'Content cannot be empty'}), 400
        
        # Update the comment
        comment.update({'content': data['content']})
        
        return jsonify({
            'message': 'Comment updated successfully',
            'comment': comment.to_dict()
        }), 200
        
    except Exception as e:
        logging.error(f"Error updating comment: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500