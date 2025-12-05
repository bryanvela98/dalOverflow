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
from models.notification import Notification
from utils.fuzzy_search import search_questions
import logging  # For logging purposes
from datetime import datetime,timedelta

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

@question_bp.route('/<int:question_id>/edit', methods=['GET'])
@login_required
def get_question_for_edit(question_id):
    """
    Get question data for editing (AC 2)
    
    Returns:
        JSON response with question data and edit permissions
    """
    try:
        question = Question.get_by_id(question_id)
        if not question:
            return jsonify({"error": "Question not found"}), 404
        
        user_id = request.user_id
        # is_moderator = getattr(request, 'is_moderator', False)
        
        # Check permissions
        can_edit, requires_review = question.can_be_edited_by(user_id)
        
        if not can_edit:
            return jsonify({
                "error": "You do not have permission to edit this question"
            }), 403
        
        return jsonify({
            "question": question.to_dict(current_user_id=user_id),
            "can_edit": can_edit,
            "requires_review": requires_review,
            "edit_window_expired": requires_review 
        }), 200
        
    except Exception as e:
        logging.error(f"Error fetching question for edit: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500


@question_bp.route('/<int:question_id>', methods=['PUT'])
@login_required
def update_question(question_id):
    """
    Update a question (AC 5)
    
    Body parameters:
        title: New title (optional)
        body: New body (optional)
        tag_ids: New tag IDs array (optional)
        last_known_update: ISO timestamp (for concurrency check)
    
    Returns:
        JSON response with updated question or error
    """
    try:
        question = Question.get_by_id(question_id)
        if not question:
            return jsonify({"error": "Question not found"}), 404
        
        user_id = request.user_id
        # is_moderator = getattr(request, 'is_moderator', False)
        
        # Check permissions
        can_edit, requires_review = question.can_be_edited_by(user_id)
        
        if not can_edit:
            return jsonify({
                "error": "You do not have permission to edit this question"
            }), 403
        
        data = request.get_json()
        
        # Concurrency check using updated_at (AC 9)
        if 'last_known_update' in data:
            try:
                # Try ISO format first
                last_known = datetime.fromisoformat(data['last_known_update'].replace('Z', '+00:00'))
            except ValueError:
                # Try HTTP date format (RFC 2822)
                from email.utils import parsedate_to_datetime
                try:
                    last_known = parsedate_to_datetime(data['last_known_update'])
                except:
                    # If both fail, skip concurrency check
                    last_known = None
            
            if last_known and question.updated_at:
                # Make both timezone-aware or both naive for comparison
                if question.updated_at.tzinfo is None:
                    last_known = last_known.replace(tzinfo=None)
                
                # Check if question was updated after user loaded it
                if (question.updated_at - last_known > timedelta(seconds=1)):
                    return jsonify({
                        "error": "This question has been modified by another user. Please refresh and try again.",
                        "concurrent_edit": True
                    }), 409
        
        # Validate fields (AC 3, AC 4)
        errors = {}
        
        title = data.get('title')
        body = data.get('body')
        tag_ids = data.get('tag_ids')
        
        # Title validation
        if title is not None:
            if not title or len(title.strip()) == 0:
                errors['title'] = 'Title is required'
            elif len(title) > 120:
                errors['title'] = 'Title must not exceed 120 characters'
        
        # Body validation
        if body is not None:
            from bs4 import BeautifulSoup
            plain_text = BeautifulSoup(body, 'html.parser').get_text()
            if not plain_text or len(plain_text.strip()) < 20:
                errors['body'] = 'Body must be at least 20 characters'
        
        # Tag validation
        if tag_ids is not None:
            if not isinstance(tag_ids, list):
                errors['tags'] = 'Tags must be an array'
            elif len(tag_ids) < 1:
                errors['tags'] = 'At least one tag is required'
            elif len(tag_ids) > 5:
                errors['tags'] = 'Maximum 5 tags allowed'
            elif len(tag_ids) != len(set(tag_ids)):
                errors['tags'] = 'Duplicate tags are not allowed'
        
        if errors:
            return jsonify({"errors": errors}), 400
        
        # Update question (no history tracking needed)
        try:
            question.update_question(
                title=title,
                body=body,
                tag_ids=tag_ids
            )
            
            
            
            return jsonify({
                "message": "Question updated successfully",
                "question": question.to_dict(current_user_id=user_id)
            }), 200
            
        except PermissionError as e:
            return jsonify({"error": str(e)}), 403
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        
    except Exception as e:
        import traceback
        logging.error(f"Error updating question: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({
            "error": "Failed to update question. Please try again.",
            "details": str(e)
        }), 500
    

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

        #Create Notification
        notification_data = {
            "user_id": data['user_id'],
            "header": "Question Created",
            "body": f"Your question '{data['title']}' has been posted successfully."
        }
        Notification.create(notification_data)
        
        return jsonify({
            'message': 'Question created successfully',
            'question': question.to_dict()
        }), 201
    except Exception as e:
        import traceback
        logging.error(f"Error creating question: {str(e)}")
        logging.error(traceback.format_exc())
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

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

# """
# Description: Question routes with edit functionality
# Last Modified By: Mahek
# Created: 2025-10-25
# Last Modified: 
#     2025-10-26 - File created with question CRUD operations.
#     2025-10-28 - Added error handling and logging functionality.
#     2025-12-02 - Added edit functionality with history tracking
# """
# from flask import Blueprint, request, jsonify
# from middleware.auth_middleware import login_required
# from models.question import Question
# from models.question_edit_history import QuestionEditHistory
# from models.notification import Notification
# from utils.fuzzy_search import search_questions
# from datetime import datetime
# import logging

# question_bp = Blueprint('questions', __name__)


# @question_bp.route('/', methods=['GET'])
# def get_questions():
#     """Get all questions.

#     Returns:
#         JSON response containing the list of questions.
#     """
#     try:
#         questions = Question.get_all()
#         if not questions:
#             return jsonify({"message": "No questions found"}), 404
        
#         # Get current user ID if authenticated
#         current_user_id = None
#         if hasattr(request, 'user_id'):
#             current_user_id = request.user_id
        
#         return jsonify({
#             "questions": [
#                 question.to_dict(include_edit_info=True, current_user_id=current_user_id) 
#                 for question in questions
#             ]
#         })
#     except Exception as e:
#         logging.error(f"Error fetching questions: {str(e)}")
#         return jsonify({"error": "Internal server error"}), 500


# @question_bp.route('/<int:question_id>', methods=['GET'])
# def get_question_by_id(question_id):
#     """Get a question by its ID and increment view count.

#     Returns:
#         JSON response containing the question details.
#     """
#     try:
#         question = Question.get_by_id(question_id)
#         if not question:
#             return jsonify({"message": "Question not found"}), 404
        
#         # Increment view count when question is accessed
#         question.increment_view_count()
        
#         # Get current user ID if authenticated
#         current_user_id = None
#         if hasattr(request, 'user_id'):
#             current_user_id = request.user_id

#         return jsonify({
#             "question": question.to_dict(include_edit_info=True, current_user_id=current_user_id)
#         })
#     except Exception as e:
#         logging.error(f"Error fetching question by ID: {str(e)}")
#         return jsonify({"error": "Internal server error"}), 500


# @question_bp.route('/<int:question_id>/edit', methods=['GET'])
# @login_required
# def get_question_for_edit(question_id):
#     """
#     Get question data for editing (AC 2)
    
#     Returns:
#         JSON response with question data and edit permissions
#     """
#     try:
#         question = Question.get_by_id(question_id)
#         if not question:
#             return jsonify({"error": "Question not found"}), 404
        
#         user_id = request.user_id
#         is_moderator = getattr(request, 'is_moderator', False)
        
#         # Check permissions (AC 12)
#         can_edit, requires_review = question.can_be_edited_by(user_id, is_moderator)
        
#         if not can_edit:
#             return jsonify({
#                 "error": "You do not have permission to edit this question"
#             }), 403
        
#         return jsonify({
#             "question": question.to_dict(include_edit_info=True, current_user_id=user_id),
#             "can_edit": can_edit,
#             "requires_review": requires_review,
#             "edit_window_expired": requires_review and not is_moderator
#         }), 200
        
#     except Exception as e:
#         logging.error(f"Error fetching question for edit: {str(e)}")
#         return jsonify({"error": "Internal server error"}), 500


# @question_bp.route('/<int:question_id>', methods=['PUT'])
# @login_required
# def update_question(question_id):
#     """
#     Update a question (AC 5)
    
#     Body parameters:
#         title: New title (optional)
#         body: New body (optional)
#         tag_ids: New tag IDs array (optional)
#         edit_reason: Reason for edit (optional)
#         last_known_update: ISO timestamp of when user loaded edit form (for concurrency check)
    
#     Returns:
#         JSON response with updated question or error
#     """
#     try:
#         question = Question.get_by_id(question_id)
#         if not question:
#             return jsonify({"error": "Question not found"}), 404
        
#         user_id = request.user_id
#         is_moderator = getattr(request, 'is_moderator', False)
        
#         # Check permissions (AC 12)
#         can_edit, requires_review = question.can_be_edited_by(user_id, is_moderator)
        
#         if not can_edit:
#             return jsonify({
#                 "error": "You do not have permission to edit this question"
#             }), 403
        
#         data = request.get_json()
        
#         # # Concurrency check (AC 9)
#         # if 'last_known_update' in data:
#         #     last_known = datetime.fromisoformat(data['last_known_update'].replace('Z', '+00:00'))
#         #     if question.last_edited_at and question.last_edited_at > last_known:
#         #         return jsonify({
#         #             "error": "This question has been modified by another user. Please refresh and try again.",
#         #             "concurrent_edit": True
#         #         }), 409

#         # Concurrency check (AC 9)
#         if 'last_known_update' in data:
#             try:
#         # Try ISO format first
#                 last_known = datetime.fromisoformat(data['last_known_update'].replace('Z', '+00:00'))
#             except ValueError:
#         # If that fails, try HTTP date format (RFC 2822)
#                 from email.utils import parsedate_to_datetime
#                 try:
#                     last_known = parsedate_to_datetime(data['last_known_update'])
#                 except:
#                     # If both fail, skip concurrency check
#                     last_known = None
            
#             if last_known and question.last_edited_at:
#                 # Make both timezone-aware or both naive for comparison
#                 if question.last_edited_at.tzinfo is None:
#                     # If last_edited_at is naive, make last_known naive too
#                     last_known = last_known.replace(tzinfo=None)
                
#                 if question.last_edited_at > last_known:
#                     return jsonify({
#                         "error": "This question has been modified by another user. Please refresh and try again.",
#                         "concurrent_edit": True
#                     }), 409
        
#         # Validate fields (AC 3, AC 4)
#         errors = {}
        
#         title = data.get('title')
#         body = data.get('body')
#         tag_ids = data.get('tag_ids')
#         edit_reason = data.get('edit_reason')
        
#         # Title validation
#         if title is not None:
#             if not title or len(title.strip()) == 0:
#                 errors['title'] = 'Title is required'
#             elif len(title) > 120:
#                 errors['title'] = 'Title must not exceed 120 characters'
        
#         # Body validation
#         if body is not None:
#             # Remove HTML tags for length check
#             from bs4 import BeautifulSoup
#             plain_text = BeautifulSoup(body, 'html.parser').get_text()
#             if not plain_text or len(plain_text.strip()) < 20:
#                 errors['body'] = 'Body must be at least 20 characters'
        
#         # Tag validation
#         if tag_ids is not None:
#             if not isinstance(tag_ids, list):
#                 errors['tags'] = 'Tags must be an array'
#             elif len(tag_ids) < 1:
#                 errors['tags'] = 'At least one tag is required'
#             elif len(tag_ids) > 5:
#                 errors['tags'] = 'Maximum 5 tags allowed'
#             elif len(tag_ids) != len(set(tag_ids)):
#                 errors['tags'] = 'Duplicate tags are not allowed'
        
#         if errors:
#             return jsonify({"errors": errors}), 400
        
#         # Update question with history tracking
#         try:
#             question.update_with_history(
#                 editor_id=user_id,
#                 title=title,
#                 body=body,
#                 tag_ids=tag_ids,
#                 edit_reason=edit_reason,
#                 is_moderator=is_moderator
#             )
            
#             # If moderator edited, optionally notify author (AC 10)
#             if is_moderator and user_id != question.user_id:
#                 # TODO: Implement notification system
#                 logging.info(f"Moderator {user_id} edited question {question_id}")
            
#             return jsonify({
#                 "message": "Question updated successfully",
#                 "question": question.to_dict(include_edit_info=True, current_user_id=user_id)
#             }), 200
            
#         except PermissionError as e:
#             return jsonify({"error": str(e)}), 403
#         except ValueError as e:
#             return jsonify({"error": str(e)}), 400
        
#     except Exception as e:
#         import traceback
#         logging.error(f"Error updating question: {str(e)}")
#         logging.error(traceback.format_exc())
#         return jsonify({
#             "error": "Failed to update question. Please try again.",
#             "details": str(e)
#         }), 500


# @question_bp.route('/<int:question_id>/history', methods=['GET'])
# def get_question_history(question_id):
#     """
#     Get edit history for a question (AC 8)
    
#     Query parameters:
#         include_content: Include full content diffs (default: false)
#         limit: Limit number of records (default: all)
    
#     Returns:
#         JSON response with edit history
#     """
#     try:
#         question = Question.get_by_id(question_id)
#         if not question:
#             return jsonify({"error": "Question not found"}), 404
        
#         include_content = request.args.get('include_content', 'false').lower() == 'true'
#         limit = request.args.get('limit', type=int)
        
#         history = QuestionEditHistory.get_by_question_id(question_id, limit=limit)
        
#         return jsonify({
#             "question_id": question_id,
#             "edit_count": question.edit_count,
#             "history": [h.to_dict(include_content_diff=include_content) for h in history]
#         }), 200
        
#     except Exception as e:
#         logging.error(f"Error fetching question history: {str(e)}")
#         return jsonify({"error": "Internal server error"}), 500


# @question_bp.route('/', methods=['POST'])
# @login_required
# def create_question():
#     """Create a question.

#     Returns:
#         JSON response containing the success message.
#     """
#     try:
#         data = request.get_json()
        
#         # Extract tag ids
#         tag_ids = data.get('tag_ids', [])
        
#         # Validate required fields
#         required_fields = ['user_id', 'title', 'body']
#         for field in required_fields:
#             if field not in data:
#                 return jsonify({'error': f'{field} is required'}), 400

#         # Create question with tags
#         question = Question.create_with_tags(data, tag_ids)
#         return jsonify({
#             'message': 'Question created successfully',
#             'question': question.to_dict(include_edit_info=True)
#         }), 201
#     except Exception as e:
#         import traceback
#         logging.error(f"Error creating question: {str(e)}")
#         logging.error(traceback.format_exc())
#         return jsonify({"error": "Internal server error", "details": str(e)}), 500


# @question_bp.route('/search', methods=['GET'])
# def title_fuzzy_search():
#     """Search questions using fuzzy matching.

#     Returns:
#         JSON response containing search results.
#     """
#     try:
#         query = request.args.get('query', '').strip() or request.args.get('title', '').strip()
        
#         if not query:
#             return jsonify({
#                 'results': [],
#                 'message': 'No query provided'
#             }), 200
        
#         # Use fuzzy search utility
#         results = search_questions(query)
        
#         return jsonify({
#             'results': results
#         }), 200
        
#     except Exception as e:
#         logging.error(f"Error searching questions: {str(e)}")
#         return jsonify({"error": "Internal server error"}), 500