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
from models.questiontag import QuestionTag
from database import db

questiontag_bp = Blueprint('questiontags', __name__)

@questiontag_bp.route('/questions/<int:question_id>/tags', methods=['GET'])
def get_tags_for_question(question_id):
    """Get all tags for a question"""
    try:
        question = Question.get_by_id(question_id)
        if not question:
            return jsonify({'error': 'Question not found'}), 404
        
        # Optimized query with JOIN (single DB call)
        tags = db.session.query(Tag)\
            .join(QuestionTag, Tag.id == QuestionTag.tag_id)\
            .filter(QuestionTag.question_id == question_id)\
            .all()
        
        return jsonify({
            'tags': [tag.to_dict() for tag in tags],
            'count': len(tags)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@questiontag_bp.route('/tags/<int:tag_id>/questions', methods=['GET'])
def get_questions_for_tag(tag_id):
    """Get all questions for a tag"""
    try:
        tag = Tag.get_by_id(tag_id)
        if not tag:
            return jsonify({'error': 'Tag not found'}), 404
        
        # Optimized query
        questions = db.session.query(Question)\
            .join(QuestionTag, Question.id == QuestionTag.question_id)\
            .filter(QuestionTag.tag_id == tag_id)\
            .all()
        
        return jsonify({
            'questions': [question.to_dict() for question in questions],
            'count': len(questions)
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500