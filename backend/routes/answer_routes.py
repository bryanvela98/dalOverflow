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