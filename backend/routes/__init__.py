"""
Description: Routes package initialization - sets up all API route blueprints.
Author: Sayoone Dhepe
Created: 2025-10-25
Last Modified: 
    2025-10-26 - Initial routes package setup with Flask blueprints.
    2025-10-28 - Added CORS configuration and common route utilities.
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import json

with open('./data/questions.json', 'r') as questionsfile:  #reading from questions.json
        questions = json.load(questionsfile)
        
# print(questions)

def app_routes(app):
    @app.route('/api/questions/<int:question_id>', methods=['GET']) #routing for 
    def get_question(question_id):
        """
        GET /api/questions/{id}
        Fetch a specific question by ID for displaying on question page
        """
        try:
            print(f"Looking for question with ID: {question_id}")
            
            question = next((q for q in questions if q['id'] == question_id), None)
            
            if not question:
                return jsonify({'error': 'Question not found'}), 404

            return jsonify({
                'question': {
                    'id': question['id'],
                    'title': question['title'],
                    'description': question['description'],
                    'tags': question['tags'],
                    'isAnonymous': question.get('isAnonymous', False),
                    'createdBy': question.get('createdBy', 'Unknown User'),
                    'createdAt': question.get('createdAt'),
                    'views': question.get('views', 0),
                    'upvotes': question.get('upvotes', 0),
                    'answers': question.get('answers', [])
                }
            }), 200
            
        except Exception as e:
            print(f"Error fetching question {question_id}: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500