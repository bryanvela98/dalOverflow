"""
Description: AI services routes for handling AI-related API endpoints.
Last Modified By: Bryan Vela
Created: 2025-10-25
Last Modified: 
    2025-11-29 - File created with AI response generation endpoint.

"""

from flask import Blueprint, request, jsonify
from models.notification import Notification
import logging  # For logging purposes
from services.gemini_services import GeminiServices

ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/answer', methods=['POST'])
def generate_ai_answer():
    """Generate an AI answer for a question

    Returns:
        JSON response containing the AI-generated answer.
    """
    try:
        data = request.get_json()
        
        # Validate input
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
            
        title = data.get('title', '').strip()
        body = data.get('body', '').strip()
        
        if not title:
            return jsonify({'error': 'Question title is required'}), 400
        
        # Generate answer using Gemini
        gemini_service = GeminiServices()
        ai_answer = gemini_service.generate_answer(title, body)
        
        return jsonify({
            'title': title,
            'body': body,
            'answer': ai_answer
        }), 200
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        logging.error(f"AI generation error: {str(e)}")
        return jsonify({'error': 'Failed to generate AI response'}), 500