"""
Description: Vote routes for handling user-related API endpoints.
Last Modified By: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-11-17 - File created with user POST GET operations.
    2025-11-18 - Added user-specific vote retrieval.
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
        required_fields = ['user_id','target_id', 'vote_type', 'target_type']
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
    Get the total vote count, upvotes, and downvotes for a specific target (question or answer).
    """
    try:
        votes = Vote.query.filter_by(target_type=target_type, target_id=target_id).all()
        if not votes:
            return jsonify({
                "vote_count": 0,
                "upvotes": 0,
                "downvotes": 0,
                "message": "No votes found"
            }), 200

        upvotes = sum(1 for v in votes if v.vote_type == "upvote")
        downvotes = sum(1 for v in votes if v.vote_type == "downvote")
        vote_count = upvotes - downvotes

        return jsonify({
            "vote_count": vote_count,
            "upvotes": upvotes,
            "downvotes": downvotes,
            "target_id": target_id,
            "target_type": target_type
        }), 200
    except Exception as e:
        logging.error(f"Error fetching vote count: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@vote_bp.route('/<int:vote_id>', methods=['PATCH'])
def update_vote(vote_id):
    """
    Update the vote_type of an existing vote (switch upvote/downvote).
    """
    try:
        data = request.get_json()
        vote = Vote.query.get(vote_id)
        if not vote:
            return jsonify({'error': 'Vote not found'}), 404


        if 'vote_type' in data:
            vote.update({'vote_type': data['vote_type']})  # update vote_type
        else:
            return jsonify({'error': 'vote_type is required'}), 400

        return jsonify({
            'message': 'Vote updated successfully',
            'vote': vote.to_dict()
        }), 200
    except Exception as e:
        logging.error(f"Error updating vote: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@vote_bp.route('/<int:vote_id>', methods=['DELETE'])
def delete_vote(vote_id):
    """
    Delete an existing vote.
    """
    try:
        vote = Vote.query.get(vote_id)
        if not vote:
            return jsonify({'error': 'Vote not found'}), 404

        vote.delete()
        return jsonify({
            'message': 'Vote deleted successfully'
        }), 200
    except Exception as e:
        logging.error(f"Error deleting vote: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500
    
    
@vote_bp.route('/user', methods=['GET'])
def get_user_votes():
    """
    Get all votes for a specific user (by user_id query param).
    /api/votes/user?user_id=5
    """
    user_id = request.args.get('user_id', type=int)
    if not user_id:
        return jsonify({'error': 'user_id is required as a query parameter'}), 400

    votes = Vote.query.filter_by(user_id=user_id).all()
    return jsonify({
        'votes': [v.to_dict() for v in votes]
    }), 200