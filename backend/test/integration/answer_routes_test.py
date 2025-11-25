"""
Description: Integration tests for answer routes API endpoints.
Author: Saayonee Dhepe
Created: 2025-11-23
Last Modified: 
    2025-11-23 - Created initial answer routes tests.
"""
import unittest
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))) # this is to ensure imports work correctly

from test.test_base import DatabaseTestCase, TestDataCreation
from database import db

class AnswerRoutesTestCase(DatabaseTestCase, TestDataCreation):
    """Integration tests for answer routes"""

    def setUp(self):
        """Set up test data for each test"""
        super().setUp()
        
        try:
            # Create test user and question
            self.test_user = self.create_test_user()
            self.test_question = self.create_test_question(
                user_id=self.test_user.id,
                title="Test Question for Answers",
                body="This is a test question body that needs answers."
            )
            # Test answer
            self.answer = self.create_test_answer(
                user_id=self.test_user.id,
                question_id=self.test_question.id,
                body="This is a test answer."
            )
            # test comments
            self.comment1 = self.create_test_comment(
                answer_id=self.answer.id,
                user_id=self.test_user.id,
                content="First comment on answer."
            )
            self.comment2 = self.create_test_comment(
                answer_id=self.answer.id,
                user_id=self.test_user.id,
                content="Second comment on answer."
            )
            # Commit all test data
            db.session.commit()
            
        except Exception as e:
            db.session.rollback()
            raise e

    def test_get_answers_endpoint_exists(self):
        """Test that the GET answers endpoint exists"""
        response = self.client.get(f'/api/answers/questions/{self.test_question.id}/answers')

        # Should not return 404 (endpoint exists)
        self.assertNotEqual(response.status_code, 404)
        
        # Should return JSON
        data = response.get_json()
        self.assertIsNotNone(data)
        
    def test_get_answers_response_structure(self):
        """Test that GET answers endpoint returns correct response structure"""
        response = self.client.get(f'/api/answers/questions/{self.test_question.id}/answers')

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        # Verify response has answers array
        self.assertIn('answers', data)
        self.assertIsInstance(data['answers'], list)
        
    def test_get_answer_count_endpoint_exists(self):
        """Test that the answer count endpoint exists and returns proper structure"""
        response = self.client.get(f'/api/answers/questions/{self.test_question.id}/answers/count')

        # Should not return 404 (endpoint exists)
        self.assertNotEqual(response.status_code, 404)
        
        # Should return JSON
        data = response.get_json()
        self.assertIsNotNone(data)

    def test_get_answer_count_response_structure(self):
        """Test that answer count endpoint returns correct response structure"""
        response = self.client.get(f'/api/answers/questions/{self.test_question.id}/answers/count')

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        
        # Verify response has required fields
        self.assertIn('question_id', data)
        self.assertIn('answer_count', data)
        self.assertIsInstance(data['question_id'], int)
        self.assertIsInstance(data['answer_count'], int)

    def test_create_answer_endpoint_exists(self):
        """Test that the POST answer endpoint exists"""
        response = self.client.post(
            f'/api/answers/questions/{self.test_question.id}/answers',
            json={'body': 'This is a test answer with sufficient length.'}
        )
        
        # Should not return 404 (endpoint exists)
        self.assertNotEqual(response.status_code, 404)
        
        # Should return JSON
        data = response.get_json()
        self.assertIsNotNone(data)
        
    def test_get_comments_for_answer(self):
        """Test GET /answers/<id>/comments returns all comments for an answer"""
        response = self.client.get(f'/api/answers/{self.answer.id}/comments')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        self.assertIn('comments', data)
        self.assertIsInstance(data['comments'], list)
        comment_ids = [c['id'] for c in data['comments']]
        self.assertIn(self.comment1.id, comment_ids)
        self.assertIn(self.comment2.id, comment_ids)
        self.assertEqual(len(data['comments']), 2)

if __name__ == '__main__':
    unittest.main()