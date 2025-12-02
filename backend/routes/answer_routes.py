# """
# Description: Answer routes for handling requests related to answers
# Author: Saayonee Dhepe
# Created: 2025-11-23

# Last Modified By: Saayonee Dhepe
# Last Modified: 2025-11-23
# """

# from flask import Blueprint, request, jsonify
# from datetime import datetime
# from middleware.auth_middleware import token_required
# from database import db
# from models import User
# from models.answer import Answer
# from models.comment import Comment
# from utils.html_sanitizer import sanitize_html_body
# from services.answer_services import AnswerServices

# answers_bp = Blueprint('answers', __name__)

# @answers_bp.route('/questions/<int:question_id>/answers', methods=['GET'])
# def get_answers(question_id):
#     """Get all answers for a question"""
#     try:
#         answer_service = AnswerServices()
        
#         # Get answers using service
#         answers = answer_service.get_answers_by_question(question_id)

#         answers_list = []
#         for answer in answers:
#             user = User.query.get(answer.user_id)
#             answers_list.append({
#                 'id': answer.id,
#                 'question_id': answer.question_id,
#                 'user_id': answer.user_id,
#                 'content': answer.body,
#                 'created_at': answer.created_at.isoformat() if answer.created_at else None,
#                 'user': {
#                     'username': user.username if user else 'Unknown',
#                     'reputation': user.reputation if user else 0
#                 }
#             })

#         return jsonify({'answers': answers_list}), 200

#     except Exception as e:
#         return jsonify({'message': f'Error fetching answers: {str(e)}'}), 500

# @answers_bp.route('/questions/<int:question_id>/answers/count', methods=['GET'])
# def get_answer_count(question_id):
#     """Get the count of answers for a question"""
#     try:
#         answer_service = AnswerServices()
        
#         # Check if question exists
#         if not answer_service.question_exists(question_id):
#             return jsonify({'message': 'Question not found'}), 404
        
#         # Get answer count using service
#         count = answer_service.count_answers_by_question(question_id)
        
#         return jsonify({
#             'question_id': question_id,
#             'answer_count': count
#         }), 200
        
#     except Exception as e:
#         return jsonify({'message': f'Error fetching answer count: {str(e)}'}), 500

# @answers_bp.route('/questions/<int:question_id>/answers', methods=['POST'])
# @token_required
# def create_answer(current_user, question_id):
#     """Create a new answer for a question"""
#     try:
#         answer_service = AnswerServices()
        
#         data = request.get_json()
#         body = data.get('body', '').strip()

#         # Validate answer body
#         if not answer_service.validate_answer_body(body):
#             return jsonify({'message': 'Answer must be at least 20 characters'}), 400

#         # Check if question exists
#         if not answer_service.question_exists(question_id):
#             return jsonify({'message': 'Question not found'}), 404

#         # Sanitize HTML content
#         sanitized_body = sanitize_html_body(body)

#         # Create new answer using service
#         new_answer = answer_service.create_answer(
#             question_id=question_id,
#             user_id=current_user.id,
#             body=sanitized_body
#         )

#         if not new_answer:
#             return jsonify({'message': 'Failed to create answer'}), 400

#         db.session.add(new_answer)
#         db.session.commit()

#         # Fetch user data for response
#         user = User.query.get(current_user.id)

#         return jsonify({
#             'message': 'Answer posted successfully',
#             'answer': {
#                 'id': new_answer.id,
#                 'question_id': new_answer.question_id,
#                 'user_id': new_answer.user_id,
#                 'content': new_answer.body,
#                 'created_at': new_answer.created_at.isoformat(),
#                 'upvotes': 0,
#                 'isAccepted': False,
#                 'user': {
#                     'username': user.username,
#                     'reputation': user.reputation
#                 }
#             }
#         }), 201

#     except Exception as e:
#         return jsonify({'message': f'Error creating answer: {str(e)}'}), 500


# @answers_bp.route('/<int:answer_id>/comments', methods=['GET'])
# def get_comments_for_answer(answer_id):
#     """Get all comments for a specific answer"""
#     try: 
#         # check answer exists
#         answer = Answer.query.get(answer_id)
#         if not answer:
#             return jsonify({'message': 'Answer not found'}), 404
        
#         #  all comments for this answer
#         comments = Comment.query.filter_by(answer_id=answer_id).all()
        
#         comments_list = []
#         for comment in comments:
#             user = User.query.get(comment.user_id)
#             comments_list.append({
#                 'id': comment.id,
#                 'answer_id': comment.answer_id,
#                 'user_id': comment.user_id,
#                 'content': comment.content,
#                 'created_at': comment.created_at.isoformat() if comment.created_at else None,
#                 'user': {
#                     'username': user.username if user else 'Unknown',
#                     'reputation': user.reputation if user else 0
#                 }
#             })
        
#         return jsonify({
#             'answer_id': answer_id,
#             'comments': comments_list
#         }), 200
        
#     except Exception as e:
#         return jsonify({'message': f'Error fetching comments: {str(e)}'}), 500

"""
Description: Answer routes for handling requests related to answers
Author: Saayonee Dhepe
Created: 2025-11-23

Last Modified By: Claude
Last Modified: 2025-12-02 - Added edit functionality
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
from middleware.auth_middleware import token_required, login_required
from database import db
from models import User
from models.answer import Answer
from models.answer_edit_history import AnswerEditHistory
from models.comment import Comment
from models.notification import Notification
from utils.html_sanitizer import sanitize_html_body
from services.answer_services import AnswerServices
import logging

answers_bp = Blueprint('answers', __name__)

@answers_bp.route('/questions/<int:question_id>/answers', methods=['GET'])
def get_answers(question_id):
    """Get all answers for a question"""
    try:
        answer_service = AnswerServices()
        
        # Get current user ID if authenticated (for permission checks)
        current_user_id = getattr(request, 'user_id', None)
        
        # Get answers using service
        answers = answer_service.get_answers_by_question(question_id)

        answers_list = []
        for answer in answers:
            user = User.query.get(answer.user_id)
            answer_dict = {
                'id': answer.id,
                'question_id': answer.question_id,
                'user_id': answer.user_id,
                'content': answer.body,
                'created_at': answer.created_at.isoformat() if answer.created_at else None,
                'is_accepted': getattr(answer, 'is_accepted', False),
                'user': {
                    'username': user.username if user else 'Unknown',
                    'reputation': user.reputation if user else 0
                },
                # AC 1: Include edit metadata
                'edit_count': getattr(answer, 'edit_count', 0),
                'last_edited_at': answer.last_edited_at.isoformat() if hasattr(answer, 'last_edited_at') and answer.last_edited_at else None,
                'is_edited': getattr(answer, 'edit_count', 0) > 0,
            }
            
            # AC 1: Add can_edit flag for current user
            if current_user_id:
                answer_dict['can_edit'] = answer.can_be_edited_by(current_user_id)
            
            answers_list.append(answer_dict)

        return jsonify({'answers': answers_list}), 200

    except Exception as e:
        logging.error(f"Error fetching answers: {str(e)}")
        return jsonify({'message': f'Error fetching answers: {str(e)}'}), 500


@answers_bp.route('/questions/<int:question_id>/answers/count', methods=['GET'])
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


@answers_bp.route('/questions/<int:question_id>/answers', methods=['POST'])
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

         #Create Notification
        notification_data = {
            "user_id": current_user.id,
            "header": "Answer Submitted",
            "body": f"Your answer to question ID {question_id} has been posted."
        }
        Notification.create(notification_data)


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
                'is_accepted': False,
                'edit_count': 0,
                'is_edited': False,
                'can_edit': True,  # Author can edit their own answer
                'user': {
                    'username': user.username,
                    'reputation': user.reputation
                }
            }
        }), 201

    except Exception as e:
        logging.error(f"Error creating answer: {str(e)}")
        return jsonify({'message': f'Error creating answer: {str(e)}'}), 500


# ============================================================
# NEW ENDPOINTS FOR ANSWER EDITING
# ============================================================

@answers_bp.route('/<int:answer_id>/edit', methods=['GET'])
@login_required
def get_answer_for_edit(answer_id):
    """
    Get answer data for editing (AC 1)
    
    Returns:
        JSON response with answer data and edit permissions
    """
    try:
        answer = Answer.query.get(answer_id)
        if not answer:
            return jsonify({"error": "Answer not found"}), 404
        
        user_id = request.user_id
        is_moderator = getattr(request, 'is_moderator', False)
        
        # Check permissions
        can_edit = answer.can_be_edited_by(user_id, is_moderator)
        
        if not can_edit:
            return jsonify({
                "error": "You do not have permission to edit this answer"
            }), 403
        
        return jsonify({
            "answer": answer.to_dict(include_edit_info=True, current_user_id=user_id),
            "can_edit": can_edit,
        }), 200
        
    except Exception as e:
        logging.error(f"Error fetching answer for edit: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@answers_bp.route('/<int:answer_id>', methods=['PUT'])
@login_required
def update_answer(answer_id):
    """
    Update an answer (AC 1, AC 2)
    
    Body parameters:
        body: New body content (required)
        edit_reason: Reason for edit (optional)
    
    Returns:
        JSON response with updated answer or error
    """
    try:
        answer = Answer.query.get(answer_id)
        if not answer:
            return jsonify({"error": "Answer not found"}), 404
        
        user_id = request.user_id
        is_moderator = getattr(request, 'is_moderator', False)
        
        # Check permissions
        can_edit = answer.can_be_edited_by(user_id, is_moderator)
        
        if not can_edit:
            return jsonify({
                "error": "You do not have permission to edit this answer"
            }), 403
        
        data = request.get_json()
        
        # Validate fields
        errors = {}
        
        body = data.get('body')
        edit_reason = data.get('edit_reason')
        
        # Body validation
        if body is not None:
            # Remove HTML tags for length check
            from bs4 import BeautifulSoup
            plain_text = BeautifulSoup(body, 'html.parser').get_text()
            if not plain_text or len(plain_text.strip()) < 20:
                errors['body'] = 'Answer body must be at least 20 characters'
        else:
            errors['body'] = 'Body is required'
        
        if errors:
            return jsonify({"errors": errors}), 400
        
        # Track if answer was accepted before edit (AC 2)
        was_accepted = answer.is_accepted
        
        # Update answer with history tracking
        try:
            answer.update_with_history(
                editor_id=user_id,
                body=body,
                edit_reason=edit_reason,
                is_moderator=is_moderator
            )
            
            # AC 2: If accepted answer was edited, notify question author
            if was_accepted and not answer.is_accepted:
                # TODO: Implement notification system
                logging.info(f"Accepted answer {answer_id} was edited and removed from accepted status")
            
            return jsonify({
                "message": "Answer updated successfully",
                "answer": answer.to_dict(include_edit_info=True, current_user_id=user_id),
                "acceptance_removed": was_accepted and not answer.is_accepted  # AC 2
            }), 200
            
        except PermissionError as e:
            return jsonify({"error": str(e)}), 403
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        
    except Exception as e:
        import traceback
        logging.error(f"Error updating answer: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({
            "error": "Failed to update answer. Please try again.",
            "details": str(e)
        }), 500


@answers_bp.route('/<int:answer_id>/history', methods=['GET'])
def get_answer_history(answer_id):
    """
    Get edit history for an answer
    
    Query parameters:
        include_content: Include full content diffs (default: false)
        limit: Limit number of records (default: all)
    
    Returns:
        JSON response with edit history
    """
    try:
        answer = Answer.query.get(answer_id)
        if not answer:
            return jsonify({"error": "Answer not found"}), 404
        
        include_content = request.args.get('include_content', 'false').lower() == 'true'
        limit = request.args.get('limit', type=int)
        
        history = AnswerEditHistory.get_by_answer_id(answer_id, limit=limit)
        
        return jsonify({
            "answer_id": answer_id,
            "edit_count": answer.edit_count,
            "history": [h.to_dict(include_content_diff=include_content) for h in history]
        }), 200
        
    except Exception as e:
        logging.error(f"Error fetching answer history: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@answers_bp.route('/<int:answer_id>/comments', methods=['GET'])
def get_comments_for_answer(answer_id):
    """Get all comments for a specific answer"""
    try: 
        # check answer exists
        answer = Answer.query.get(answer_id)
        if not answer:
            return jsonify({'message': 'Answer not found'}), 404
        
        #  all comments for this answer
        comments = Comment.query.filter_by(answer_id=answer_id).all()
        
        comments_list = []
        for comment in comments:
            user = User.query.get(comment.user_id)
            comments_list.append({
                'id': comment.id,
                'answer_id': comment.answer_id,
                'user_id': comment.user_id,
                'content': comment.content,
                'created_at': comment.created_at.isoformat() if comment.created_at else None,
                'user': {
                    'username': user.username if user else 'Unknown',
                    'reputation': user.reputation if user else 0
                }
            })
        
        return jsonify({
            'answer_id': answer_id,
            'comments': comments_list
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Error fetching comments: {str(e)}'}), 500