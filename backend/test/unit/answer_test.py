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
from models.answer import Answer

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
        
    def test_create_answer_with_invalid_body(self):
        """Test creating answer with invalid body returns None"""
        result = self.answer_service.create_answer(
            question_id=1,
            user_id=1,
            body="short"
        )
        
        self.assertIsNone(result)
    
    def test_create_answer_with_nonexistent_question(self):
        """Test creating answer for non-existent question returns None"""
        Question.query = MagicMock()
        Question.query.get = MagicMock(return_value=None)
        
        result = self.answer_service.create_answer(
            question_id=999,
            user_id=1,
            body="This is a valid answer body with sufficient length."
        )
        
        self.assertIsNone(result)
        

class TestAnswerRetrieval(unittest.TestCase):
    """Test answer retrieval from database"""
    
    def setUp(self):
        self.answer_service = AnswerServices()
        self.mock_db = MagicMock()
    
    def test_get_answers_by_question_id(self):
        """Test retrieving answers for a specific question"""
        mock_answer1 = MagicMock()
        mock_answer1.id = 1
        mock_answer1.question_id = 1
        mock_answer1.body = "First answer with sufficient length here."
        
        mock_answer2 = MagicMock()
        mock_answer2.id = 2
        mock_answer2.question_id = 1
        mock_answer2.body = "Second answer also with sufficient length."
        
        Answer.query = MagicMock()
        Answer.query.filter_by = MagicMock()
        Answer.query.filter_by.return_value.all = MagicMock(
            return_value=[mock_answer1, mock_answer2]
        )
        
        result = self.answer_service.get_answers_by_question(question_id=1)
        
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].question_id, 1)
        self.assertEqual(result[1].question_id, 1)
        
    def test_get_answers_by_user_id(self):
        """Test retrieving all answers by a specific user"""
        mock_answer1 = MagicMock()
        mock_answer1.id = 1
        mock_answer1.user_id = 1
        mock_answer1.body = "First answer from user."
        
        mock_answer2 = MagicMock()
        mock_answer2.id = 2
        mock_answer2.user_id = 1
        mock_answer2.body = "Second answer from same user."
        
        Answer.query = MagicMock()
        Answer.query.filter_by = MagicMock()
        Answer.query.filter_by.return_value.all = MagicMock(
            return_value=[mock_answer1, mock_answer2]
        )
        
        result = self.answer_service.get_answers_by_user(user_id=1)
        
        self.assertEqual(len(result), 2)
        self.assertEqual(result[0].user_id, 1)
        self.assertEqual(result[1].user_id, 1)


if __name__ == '__main__':
    unittest.main()
