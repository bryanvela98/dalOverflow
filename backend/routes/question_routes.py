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
from models.question import Question
from utils.fuzzy_search import search_questions
import logging  # For logging purposes

question_bp = Blueprint('questions', __name__)

@question_bp.route('/', methods=['GET'])
def get_questions():
    """Get all questions.

    Returns:
        JSON response containing the list of questions.
    """
    try:
        questions = Question.get_all()
        if not questions:
            return jsonify({"message": "No questions found"}), 404
        return jsonify({
            "questions": [question.to_dict() for question in questions]
        })
    except Exception as e:
        logging.error(f"Error fetching questions: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@question_bp.route('/<int:question_id>', methods=['GET'])
def get_question_by_id(question_id):
    """Get a question by its ID and increment view count.

    Returns:
        JSON response containing the question details.
    """
    try:
        question = Question.get_by_id(question_id)
        if not question:
            return jsonify({"message": "Question not found"}), 404
        
        # Increment view count when question is accessed
        question.increment_view_count()

        return jsonify({
            "question": question.to_dict()
        })
    except Exception as e:
        logging.error(f"Error fetching question by ID: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@question_bp.route('/', methods=['POST'])
def create_question():
    """Create a question.

    Returns:
        JSON response containing the success message.
    
    """
    try:
        data = request.get_json()
        
        #extracting tags ids
        tag_ids = data.get('tag_ids', [])
        
        # Validate required fields
        required_fields = ['user_id', 'title', 'body']#, 'accepted_answer_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'{field} is required'}), 400

        # Create question with tags
        question = Question.create_with_tags(data, tag_ids)
        return jsonify({
            'message': 'Question created successfully',
            'question': question.to_dict()
        }), 201
    except Exception as e:
        logging.error(f"Error creating question: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@question_bp.route('/search', methods=['GET'])
def title_fuzzy_search():
    """Search questions using fuzzy matching.

    Returns:
        JSON response containing search results.
    """
    try:
        query = request.args.get('query', '').strip() or request.args.get('title', '').strip()
        
        if not query:
            return jsonify({
                'results': [],
                'message': 'No query provided'
            }), 200
        
        # uuse fuzzy search utility
        results = search_questions(query)
        
        return jsonify({
            'results': results
        }), 200
        
    except Exception as e:
        logging.error(f"Error searching questions: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500