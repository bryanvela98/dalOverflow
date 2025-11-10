"""
Description: User routes for handling user-related API endpoints.
Last Modified By: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created with user CRUD operations.
    2025-10-28 - Added error handling and logging functionality.
"""
from flask import Blueprint, request, jsonify
from middleware.auth_middleware import login_required
from models.tag import Tag
from utils.fuzzy_search import search_questions
import logging  # For logging purposes

tag_bp = Blueprint('tags', __name__)

@tag_bp.route('/', methods=['GET'])
def get_tags():
    """Get all tags.

    Returns:
        JSON response containing the list of tags.
    """
    try:
        tags = Tag.get_all()
        if not tags:
            return jsonify({"message": "No tags found"}), 404

        return jsonify({
            "tags": [tag.to_dict() for tag in tags]
        })
    except Exception as e:
        logging.error(f"Error fetching tags: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@tag_bp.route('/<int:tag_id>', methods=['GET'])
def get_tag_by_id(tag_id):
    """Get a tag by its ID.

    Returns:
        JSON response containing the question details.
    """
    try:
        tag = Tag.get_by_id(tag_id)
        if not tag:
            return jsonify({"message": "Tag not found"}), 404

        return jsonify({
            "tag": tag.to_dict()
        })
    except Exception as e:
        logging.error(f"Error fetching tag by ID: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@tag_bp.route('/', methods=['POST'])
def create_tag():
    """Create a new tag.

    Returns:
        JSON response containing the success message.
    """
    try:
        data = request.get_json()
        tag = Tag.create(data)
        return jsonify({
            "message": "Tag created successfully",
            "tag": tag.to_dict()
        }), 201
    except Exception as e:
        logging.error(f"Error creating tag: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

