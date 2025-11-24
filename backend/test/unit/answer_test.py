"""
Description: Unit tests for answer functionality
Author: Saayonee Dhepe
Created: 2025-11-23
Last Modified: 
    2025-11-23 - Created unit tests for answer validation and database operations.
"""
import unittest
from unittest.mock import MagicMock
from services.answer_services import AnswerServices
from models.question import Question
from datetime import datetime

class TestAnswerValidation(unittest.TestCase):
    """Test answer validation logic"""
    
    def setUp(self):
        self.answer_service = AnswerServices()
    
    def test_validate_answer_body_valid(self):
        """Test that valid answer body passes validation"""
        body = "This is a valid answer with at least 20 characters."
        result = self.answer_service.validate_answer_body(body)
        self.assertTrue(result)
    
class TestAnswerCreation(unittest.TestCase):
    """Test answer creation functionality"""
    
    def setUp(self):
        self.answer_service = AnswerServices()
        self.mock_db = MagicMock()
    
    def test_create_answer_with_valid_data(self):
        """Test creating an answer with valid data"""
        # Mock question exists
        mock_question = MagicMock()
        mock_question.id = 1
        
        Question.query = MagicMock()
        Question.query.get = MagicMock(return_value=mock_question)
        
        result = self.answer_service.create_answer(
            question_id=1,
            user_id=1,
            body="This is a valid answer body with sufficient length."
        )
        
        self.assertIsNotNone(result)
        self.assertEqual(result.question_id, 1)
        self.assertEqual(result.user_id, 1)


if __name__ == '__main__':
    unittest.main()
