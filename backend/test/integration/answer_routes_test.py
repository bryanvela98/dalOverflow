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
            
            # Commit all test data
            db.session.commit()
            
        except Exception as e:
            db.session.rollback()
            raise e

    def test_get_answers_endpoint_exists(self):
        """Test that the GET answers endpoint exists"""
        response = self.client.get(f'/api/questions/{self.test_question.id}/answers')
        
        # Should not return 404 (endpoint exists)
        self.assertNotEqual(response.status_code, 404)
        
        # Should return JSON
        data = response.get_json()
        self.assertIsNotNone(data)