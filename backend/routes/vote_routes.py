"""
Description: Vote routes for handling user-related API endpoints.
Last Modified By: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-11-17 - File created with user POST GET operations.
"""
from flask import Blueprint, request, jsonify
from models.vote import Vote
import logging  # For logging purposes

vote_bp = Blueprint('votes', __name__)

@vote_bp.route('/', methods=['GET'])
def get_votes():
    """Get all votes.

    Returns:
        JSON response containing the list of votes.
    """
    try:
        votes = Vote.get_all()
        if not votes:
            return jsonify({"message": "No votes found"}), 404
        return jsonify({
            "votes": [vote.to_dict() for vote in votes]
        })
    except Exception as e:
        logging.error(f"Error fetching votes: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@vote_bp.route('/', methods=['POST'])
def create_vote():
    """Create a vote.

    Returns:
        JSON response containing the success message.
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['vote_type', 'target_type']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400
            
        vote = Vote.create(data)
        return jsonify({
            'message': 'Vote created successfully',
            'vote': vote.to_dict()
        }), 201
    except Exception as e:
        logging.error(f"Error creating vote: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
@vote_bp.route('/<target_type>/<int:target_id>', methods=['GET'])
def get_vote_count(target_type, target_id):
    """
    Get the total vote count for a specific target (question or answer).
    """
    try:
        votes = Vote.query.filter_by(target_type=target_type, target_id=target_id).all()
        if not votes:
            return jsonify({"vote_count": 0, "message": "No votes found"}), 200

        # Example: upvote = +1, downvote = -1
        vote_count = sum(1 if v.vote_type == "upvote" else -1 for v in votes)
        return jsonify({
            "vote_count": vote_count,
            "target_id": target_id,
            "target_type": target_type
        }), 200
    except Exception as e:
        logging.error(f"Error fetching vote count: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500