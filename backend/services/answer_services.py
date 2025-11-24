"""
Description: Answer services for handling answer-related business logic
Author: Saayonee Dhepe
Created: 2025-11-23

Last Modified By: Saayonee Dhepe
Last Modified: 2025-11-23
"""

from models.question import Question
from models.answer import Answer
from datetime import datetime
class AnswerServices:
    def __init__(self):
        pass

    def validate_answer_body(self, body):
        if not body:
            return False
        
        stripped_body = body.strip()
        if len(stripped_body) < 20:
            return False
        
        return True
    
    def question_exists(self, question_id):
        question = Question.query.get(question_id)
        return question is not None
    
    def create_answer(self, question_id, user_id, body):
        if not self.validate_answer_body(body):
            return None
        
        if not self.question_exists(question_id):
            return None
        
        new_answer = Answer(
            question_id=question_id,
            user_id=user_id,
            body=body.strip(),
            created_at=datetime.utcnow()
        )
        
        return new_answer