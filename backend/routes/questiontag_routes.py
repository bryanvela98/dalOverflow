"""
Description: QuestionTag routes for handling question-tag relationship API endpoints.
Last Modified By: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-10-26 - File created as placeholder for question-tag operations.
"""
from flask import Blueprint, jsonify
from models.question import Question
from models.tag import Tag

questiontag_bp = Blueprint('questiontags', __name__)

@questiontag_bp.route('/questions/<int:question_id>/tags', methods=['GET'])
def get_tags_for_question(question_id):
    """Get all tags for a question"""
    try:
        #  question exists
        question = Question.get_by_id(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        # Return empty tags
        return jsonify({'tags': []}), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500