"""
Description: Answer services for handling answer-related business logic
Author: Saayonee Dhepe
Created: 2025-11-23

Last Modified By: Saayonee Dhepe
Last Modified: 2025-11-23
"""


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