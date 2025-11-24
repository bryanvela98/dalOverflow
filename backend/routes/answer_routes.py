"""
Description: Answer routes for handling requests related to answers
Author: Saayonee Dhepe
Created: 2025-11-23

Last Modified By: Saayonee Dhepe
Last Modified: 2025-11-23
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from middleware.auth_middleware import token_required
from database import db
from models import Answer, User, Question
from utils.html_sanitizer import sanitize_html_body
from services.answer_services import AnswerServices

answers_bp = Blueprint('answers', __name__)

@answers_bp.route('/<int:question_id>/answers', methods=['GET'])
def get_answers(question_id):
    """Get all answers for a question"""
    try:
        answer_service = AnswerServices()
        
        # Get answers using service
        answers = answer_service.get_answers_by_question(question_id)

        answers_list = []
        for answer in answers:
            user = User.query.get(answer.user_id)
            answers_list.append({
                'id': answer.id,
                'question_id': answer.question_id,
                'user_id': answer.user_id,
                'content': answer.body,
                'created_at': answer.created_at.isoformat() if answer.created_at else None,
                'user': {
                    'username': user.username if user else 'Unknown',
                    'reputation': user.reputation if user else 0
                }
            })

        return jsonify({'answers': answers_list}), 200

    except Exception as e:
        return jsonify({'message': f'Error fetching answers: {str(e)}'}), 500
    
@answers_bp.route('/<int:question_id>/answers/count', methods=['GET'])
def get_answer_count(question_id):
    """Get the count of answers for a question"""
    try:
        answer_service = AnswerServices()
        
        # Check if question exists
        if not answer_service.question_exists(question_id):
            return jsonify({'message': 'Question not found'}), 404
        
        # Get answer count using service
        count = answer_service.count_answers_by_question(question_id)
        
        return jsonify({
            'question_id': question_id,
            'answer_count': count
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error fetching answer count: {str(e)}'}), 500

@answers_bp.route('/<int:question_id>/answers', methods=['POST'])
@token_required
def create_answer(current_user, question_id):
    """Create a new answer for a question"""
    try:
        answer_service = AnswerServices()
        
        data = request.get_json()
        body = data.get('body', '').strip()

        # Validate answer body
        if not answer_service.validate_answer_body(body):
            return jsonify({'message': 'Answer must be at least 20 characters'}), 400

        # Check if question exists
        if not answer_service.question_exists(question_id):
            return jsonify({'message': 'Question not found'}), 404

        # Sanitize HTML content
        sanitized_body = sanitize_html_body(body)

        # Create new answer using service
        new_answer = answer_service.create_answer(
            question_id=question_id,
            user_id=current_user.id,
            body=sanitized_body
        )

        if not new_answer:
            return jsonify({'message': 'Failed to create answer'}), 400

        db.session.add(new_answer)
        db.session.commit()

        # Fetch user data for response
        user = User.query.get(current_user.id)

        return jsonify({
            'message': 'Answer posted successfully',
            'answer': {
                'id': new_answer.id,
                'question_id': new_answer.question_id,
                'user_id': new_answer.user_id,
                'content': new_answer.body,
                'created_at': new_answer.created_at.isoformat(),
                'upvotes': 0,
                'isAccepted': False,
                'user': {
                    'username': user.username,
                    'reputation': user.reputation
                }
            }
        }), 201

    except Exception as e:
        return jsonify({'message': f'Error creating answer: {str(e)}'}), 500
